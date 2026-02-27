import { Body, Controller, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SosService } from './sos.service';
import type { EmergencyType } from '@prisma/client';

@ApiTags('sos')
@Controller('sos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @Get('active')
  getActive() {
    return this.sosService.getActive();
  }

  /** Admin – list all SOS broadcasts */
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.sosService.findAll();
  }

  /** Admin / Guard – create a new SOS broadcast */
  @Roles('ADMIN', 'GUARD')
  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() body: { type: EmergencyType; message: string },
  ) {
    return this.sosService.create(req.user.id, body.type, body.message);
  }

  /** Admin / Guard – close an active SOS */
  @Roles('ADMIN', 'GUARD')
  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.sosService.close(id);
  }
}
