import { Body, Controller, Get, Param, Post, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EntryLogsService } from './entry-logs.service';
import { CreateEntryLogDto } from './dto/create-entry-log.dto';

@ApiTags('entry-logs')
@Controller('entry-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EntryLogsController {
  constructor(private readonly entryLogsService: EntryLogsService) {}

  /** Guard scans a QR code → creates entry/exit record */
  @Roles('GUARD')
  @Post('scan')
  createFromScan(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateEntryLogDto,
  ) {
    return this.entryLogsService.createFromScan(req.user.id, dto);
  }

  /** Look up a user by QR token (guard pre-scan verification) */
  @Roles('GUARD')
  @Get('lookup/:qrToken')
  lookupByQr(@Param('qrToken') qrToken: string) {
    return this.entryLogsService.findUserByQrToken(qrToken);
  }

  /** Guard – recent logs */
  @Roles('GUARD')
  @Get('recent')
  getRecent() {
    return this.entryLogsService.findRecent();
  }

  @Get('me')
  getMyEntries(@Request() req: { user: { id: string } }) {
    return this.entryLogsService.findByUser(req.user.id);
  }

  /** Admin / Guard – get all entry logs with optional filters */
  @Roles('ADMIN', 'GUARD')
  @Get()
  findAll(@Query('take') take?: string) {
    return this.entryLogsService.findAll(take ? parseInt(take, 10) : 50);
  }
}
