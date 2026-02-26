import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateIncidentDto) {
    return this.prisma.incident.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        severity: dto.severity,
        imageUrl: dto.imageUrl,
        anonymous: dto.anonymous ?? false,
        reportedById: userId,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.incident.findMany({
      where: { reportedById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reportedBy: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });
  }

  async resolve(id: string, actionTaken: string) {
    const incident = await this.prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new NotFoundException(`Incident ${id} not found`);
    return this.prisma.incident.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        actionTaken,
        resolvedAt: new Date(),
      },
    });
  }
}
