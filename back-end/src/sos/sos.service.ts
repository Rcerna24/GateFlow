import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
