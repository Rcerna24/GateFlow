import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalStudents,
      totalFaculty,
      totalStaff,
      totalGuards,
      entriesToday,
      totalEntryLogs,
      pendingIncidents,
      resolvedIncidents,
      pendingVisitors,
      approvedVisitors,
      activeSos,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.user.count({ where: { role: 'FACULTY' } }),
      this.prisma.user.count({ where: { role: 'STAFF' } }),
      this.prisma.user.count({ where: { role: 'GUARD' } }),
      this.prisma.entryLog.count({ where: { timestamp: { gte: todayStart } } }),
      this.prisma.entryLog.count(),
      this.prisma.incident.count({ where: { status: 'PENDING' } }),
      this.prisma.incident.count({ where: { status: 'RESOLVED' } }),
      this.prisma.visitorPass.count({ where: { status: 'PENDING' } }),
      this.prisma.visitorPass.count({ where: { status: 'APPROVED' } }),
      this.prisma.sOSBroadcast.count({ where: { isActive: true } }),
    ]);

    return {
      totalUsers,
      totalStudents,
      totalFaculty,
      totalStaff,
      totalGuards,
      entriesToday,
      totalEntryLogs,
      pendingIncidents,
      resolvedIncidents,
      pendingVisitors,
      approvedVisitors,
      activeSos,
    };
  }
}
