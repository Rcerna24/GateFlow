import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VisitorPassModule } from './visitor-pass/visitor-pass.module';
import { MailModule } from './mail/mail.module';
import { EntryLogsModule } from './entry-logs/entry-logs.module';
import { IncidentsModule } from './incidents/incidents.module';
import { SosModule } from './sos/sos.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MailModule,
    UsersModule,
    AuthModule,
    VisitorPassModule,
    EntryLogsModule,
    IncidentsModule,
    SosModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
