import { Body, Controller, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SosService } from './sos.service';
import { CreateSosDto } from './dto/create-sos.dto';

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

  /** Trigger a new SOS broadcast */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateSosDto,
  ) {
    return this.sosService.create(req.user.id, dto);
  }

  /** Close / deactivate an SOS broadcast */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.sosService.close(id);
  }
}
