import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { EmergencyType } from '@prisma/client';

@Injectable()
export class SosService {
  constructor(private readonly prisma: PrismaService) {}

  async getActive() {
    return this.prisma.sOSBroadcast.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        triggeredBy: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.sOSBroadcast.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        triggeredBy: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });
  }

  async create(userId: string, type: EmergencyType, message: string) {
    return this.prisma.sOSBroadcast.create({
      data: { type, message, triggeredById: userId },
    });
  }

  async close(id: string) {
    const sos = await this.prisma.sOSBroadcast.findUnique({ where: { id } });
    if (!sos) throw new NotFoundException(`SOS broadcast ${id} not found`);
    return this.prisma.sOSBroadcast.update({
      where: { id },
      data: { isActive: false, closedAt: new Date() },
    });
  }
}
