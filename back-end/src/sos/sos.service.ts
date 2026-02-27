import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSosDto } from './dto/create-sos.dto';

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

  /** Trigger a new SOS broadcast */
  async create(triggeredById: string, dto: CreateSosDto) {
    return this.prisma.sOSBroadcast.create({
      data: {
        type: dto.type,
        message: dto.message,
        triggeredById,
        isActive: true,
      },
      include: {
        triggeredBy: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });
  }

  /** Close / deactivate an SOS broadcast */
  async close(id: string) {
    const sos = await this.prisma.sOSBroadcast.findUnique({ where: { id } });
    if (!sos) throw new NotFoundException(`SOS broadcast ${id} not found`);

    return this.prisma.sOSBroadcast.update({
      where: { id },
      data: { isActive: false, closedAt: new Date() },
      include: {
        triggeredBy: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });
  }
}
