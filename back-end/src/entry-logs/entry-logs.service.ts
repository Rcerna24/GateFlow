import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntryLogDto } from './dto/create-entry-log.dto';

@Injectable()
export class EntryLogsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Look up a user by their QR token (for guard scanning) */
  async findUserByQrToken(qrToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { qrToken },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        qrToken: true,
      },
    });
    if (!user) throw new NotFoundException('No user found for this QR code');
    return user;
  }

  /** Guard scans a QR code → create an entry/exit log */
  async createFromScan(guardId: string, dto: CreateEntryLogDto) {
    const user = await this.findUserByQrToken(dto.qrToken);
    return this.prisma.entryLog.create({
      data: {
        userId: user.id,
        guardId,
        type: dto.type,
        location: dto.location,
      },
      include: {
        user: { select: { firstName: true, lastName: true, role: true } },
        guard: { select: { firstName: true, lastName: true } },
      },
    });
  }

  /** All recent entry logs (for guards) */
  async findRecent(take = 50) {
    return this.prisma.entryLog.findMany({
      orderBy: { timestamp: 'desc' },
      take,
      include: {
        user: { select: { firstName: true, lastName: true, role: true } },
        guard: { select: { firstName: true, lastName: true } },
      },
    });
  }

  /** A specific user's entries (for students/faculty viewing their own) */
  async findByUser(userId: string) {
    return this.prisma.entryLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 20,
      include: {
        guard: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async findAll(take = 50) {
    return this.prisma.entryLog.findMany({
      orderBy: { timestamp: 'desc' },
      take,
      include: {
        user: {
          select: { firstName: true, lastName: true, role: true, email: true },
        },
        guard: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }
}
