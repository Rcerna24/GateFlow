import { Module } from '@nestjs/common';
import { EntryLogsController } from './entry-logs.controller';
import { EntryLogsService } from './entry-logs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EntryLogsController],
  providers: [EntryLogsService],
  exports: [EntryLogsService],
})
export class EntryLogsModule {}
