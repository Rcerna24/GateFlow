import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitorPassDto } from './dto/create-visitor-pass.dto';

@Injectable()
export class VisitorPassService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVisitorPassDto) {
    return this.prisma.visitorPass.create({
      data: {
        fullName: dto.fullName,
        contactNumber: dto.contactNumber,
        purpose: dto.purpose,
        personToVisit: dto.personToVisit,
        visitDate: new Date(dto.visitDate),
        timeWindowStart: new Date(dto.timeWindowStart),
        timeWindowEnd: new Date(dto.timeWindowEnd),
      },
    });
  }

  async findAll() {
    return this.prisma.visitorPass.findMany({
      orderBy: { createdAt: 'desc' },
      include: { approvedBy: { select: { firstName: true, lastName: true } } },
    });
  }

  async findOne(id: string) {
    const pass = await this.prisma.visitorPass.findUnique({
      where: { id },
      include: { approvedBy: { select: { firstName: true, lastName: true } } },
    });
    if (!pass) {
      throw new NotFoundException(`Visitor pass ${id} not found`);
    }
    return pass;
  }

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED', approvedById?: string) {
    await this.findOne(id);
    return this.prisma.visitorPass.update({
      where: { id },
      data: {
        status,
        approvedById: status === 'APPROVED' ? approvedById : undefined,
        qrToken: status === 'APPROVED' ? crypto.randomUUID() : undefined,
      },
    });
  }
}
