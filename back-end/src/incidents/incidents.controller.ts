import { Body, Controller, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@ApiTags('incidents')
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateIncidentDto,
  ) {
    return this.incidentsService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  getMyIncidents(@Request() req: { user: { id: string } }) {
    return this.incidentsService.findByUser(req.user.id);
  }

  /** Admin – list all incidents */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.incidentsService.findAll();
  }

  /** Admin / Guard – resolve an incident */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Body() body: { actionTaken: string },
  ) {
    return this.incidentsService.resolve(id, body.actionTaken);
  }
}
