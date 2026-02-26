import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EntryLogsService } from './entry-logs.service';
import { CreateEntryLogDto } from './dto/create-entry-log.dto';

@ApiTags('entry-logs')
@Controller('entry-logs')
export class EntryLogsController {
  constructor(private readonly entryLogsService: EntryLogsService) {}

  /** Guard scans a QR code → creates entry/exit record */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('scan')
  createFromScan(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateEntryLogDto,
  ) {
    return this.entryLogsService.createFromScan(req.user.id, dto);
  }

  /** Look up a user by QR token (guard pre-scan verification) */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('lookup/:qrToken')
  lookupByQr(@Param('qrToken') qrToken: string) {
    return this.entryLogsService.findUserByQrToken(qrToken);
  }

  /** All recent logs (for guards) */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('recent')
  getRecent() {
    return this.entryLogsService.findRecent();
  }

  /** Current user's own entries */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  getMyEntries(@Request() req: { user: { id: string } }) {
    return this.entryLogsService.findByUser(req.user.id);
  }
}
