import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EntryLogsService } from './entry-logs.service';

@ApiTags('entry-logs')
@Controller('entry-logs')
export class EntryLogsController {
  constructor(private readonly entryLogsService: EntryLogsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  getMyEntries(@Request() req: { user: { id: string } }) {
    return this.entryLogsService.findByUser(req.user.id);
  }
}
