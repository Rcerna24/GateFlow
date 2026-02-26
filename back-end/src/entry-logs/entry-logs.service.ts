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
}
