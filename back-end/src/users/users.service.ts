import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private stripPassword(user: { password: string; [key: string]: unknown }) {
    const { password, passwordResetToken, passwordResetExpiry, ...rest } = user;
    return rest;
  }

  async create(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
    return this.stripPassword(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.stripPassword(u));
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} was not found`);
    }
    return this.stripPassword(user);
  }

  /** Internal – returns raw user with password for auth checks */
  async findOneRaw(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} was not found`);
    }
    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findOneRaw(id);
    const updated = await this.prisma.user.update({ where: { id }, data });
    return this.stripPassword(updated);
  }

  async toggleActive(id: string) {
    const user = await this.findOneRaw(id);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
    return this.stripPassword(updated);
  }

  async remove(id: string) {
    await this.findOneRaw(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
