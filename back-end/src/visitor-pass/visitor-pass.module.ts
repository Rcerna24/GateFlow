import { Module } from '@nestjs/common';
import { VisitorPassService } from './visitor-pass.service';
import { VisitorPassController } from './visitor-pass.controller';

@Module({
  controllers: [VisitorPassController],
  providers: [VisitorPassService],
  exports: [VisitorPassService],
})
export class VisitorPassModule {}
