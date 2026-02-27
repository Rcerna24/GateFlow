import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { ResolveIncidentDto } from './dto/resolve-incident.dto';

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

  /** All incidents (for guards/admins) */
  async findAll() {
    return this.prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        reportedBy: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });
  }

  /** A user's own incidents */
  async findByUser(userId: string) {
    return this.prisma.incident.findMany({
      where: { reportedById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Resolve an incident (guard/admin sets status + optional actionTaken) */
  async resolve(incidentId: string, dto: ResolveIncidentDto) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId },
    });
    if (!incident) throw new NotFoundException(`Incident ${incidentId} not found`);

    return this.prisma.incident.update({
      where: { id: incidentId },
      data: {
        status: 'RESOLVED',
        actionTaken: dto.actionTaken ?? null,
        resolvedAt: new Date(),
      },
      include: {
        reportedBy: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });
  }
}
