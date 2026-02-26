import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    this.fromAddress = this.config.get<string>(
      'SMTP_FROM',
      'GateFlow Security <noreply@gateflow.app>',
    );

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: false, // true for 465, false for 587 (STARTTLS)
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
  ): Promise<void> {
    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    );
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.fromAddress,
      to,
      subject: 'GateFlow — Reset Your Password',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="margin: 0; color: #0f172a; font-size: 20px;">GateFlow</h2>
            <p style="margin: 4px 0 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Smart Security System</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />

          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong>15 minutes</strong>.
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 10px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">
              Reset Password
            </a>
          </div>

          <p style="color: #64748b; font-size: 12px; line-height: 1.6;">
            If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
          </p>

          <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; text-align: center;">
            &copy; 2026 GateFlow &middot; Visayas State University
          </p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${to} (messageId: ${info.messageId})`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
      throw error;
    }
  }
}
