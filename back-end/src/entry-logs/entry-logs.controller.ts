import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EntryLogsService } from './entry-logs.service';

@ApiTags('entry-logs')
@Controller('entry-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EntryLogsController {
  constructor(private readonly entryLogsService: EntryLogsService) {}

  @Get('me')
  getMyEntries(@Request() req: { user: { id: string } }) {
    return this.entryLogsService.findByUser(req.user.id);
  }

  /** Admin – get all entry logs with optional filters */
  @Roles('ADMIN', 'GUARD')
  @Get()
  findAll(@Query('take') take?: string) {
    return this.entryLogsService.findAll(take ? parseInt(take, 10) : 50);
  }
}
