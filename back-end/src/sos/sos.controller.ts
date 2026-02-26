import { Body, Controller, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SosService } from './sos.service';
import type { EmergencyType } from '@prisma/client';

@ApiTags('sos')
@Controller('sos')
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('active')
  getActive() {
    return this.sosService.getActive();
  }

  /** Admin – list all SOS broadcasts */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.sosService.findAll();
  }

  /** Admin / Guard – create a new SOS broadcast */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() body: { type: EmergencyType; message: string },
  ) {
    return this.sosService.create(req.user.id, body.type, body.message);
  }

  /** Admin / Guard – close an active SOS */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.sosService.close(id);
  }
}
