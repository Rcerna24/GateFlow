import { Body, Controller, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VisitorPassService } from './visitor-pass.service';
import { CreateVisitorPassDto } from './dto/create-visitor-pass.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('visitor-passes')
@Controller('visitor-passes')
export class VisitorPassController {
  constructor(private readonly visitorPassService: VisitorPassService) {}

  /** Public – visitors don't need an account */
  @Post()
  create(@Body() dto: CreateVisitorPassDto) {
    return this.visitorPassService.create(dto);
  }

  /** Protected – only guards/admin can list passes */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'GUARD')
  @Get()
  findAll() {
    return this.visitorPassService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'GUARD')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.visitorPassService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'GUARD')
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.visitorPassService.updateStatus(id, 'APPROVED', req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'GUARD')
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.visitorPassService.updateStatus(id, 'REJECTED');
  }
}
