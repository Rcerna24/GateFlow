import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EntryLogsService {
  constructor(private readonly prisma: PrismaService) {}

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
