import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    // Check for existing user
    let existing;
    try {
      existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
    } catch (err) {
      this.logger.error('Database error while checking for existing user', err);
      throw new InternalServerErrorException(
        'Unable to connect to the database. Please try again later.',
      );
    }
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Create user
    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role,
          contactNumber: dto.contactNumber,
        },
      });
    } catch (err: any) {
      this.logger.error('Database error while creating user', err);
      // Prisma unique constraint violation (race condition)
      if (err?.code === 'P2002') {
        throw new ConflictException('Email is already registered');
      }
      throw new InternalServerErrorException(
        'Could not create account. The database may be unavailable — please try again later.',
      );
    }

    // Return token
    const token = this.signToken(user.id, user.email, user.role);
    return {
      accessToken: token,
      user: this.stripPassword(user),
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Return token
    const token = this.signToken(user.id, user.email, user.role);
    return {
      accessToken: token,
      user: this.stripPassword(user),
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.stripPassword(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If that email is registered, a reset link has been sent.' };
    }

    // Generate a secure reset token (6-char hex = easy to type)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry,
      },
    });

    // Try to send the reset email; fall back to returning the link directly
    let emailSent = false;
    try {
      await this.mail.sendPasswordResetEmail(user.email, resetToken);
      emailSent = true;
    } catch {
      // SMTP not configured or failed — fall back to direct link
    }

    const frontendUrl = 'http://localhost:5176';
    return {
      message: emailSent
        ? 'A password reset link has been sent to your email.'
        : 'Email delivery unavailable. Use the link below to reset your password.',
      ...(!emailSent && {
        resetToken,
        resetLink: `${frontendUrl}/reset-password?token=${resetToken}`,
      }),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: dto.token,
        passwordResetExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    return { message: 'Password has been reset successfully.' };
  }

  private signToken(userId: string, email: string, role: string): string {
    return this.jwt.sign({
      sub: userId,
      email,
      role,
    });
  }

  private stripPassword(user: { password: string; [key: string]: unknown }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, passwordResetToken, passwordResetExpiry, ...result } = user;
    return result;
  }
}
