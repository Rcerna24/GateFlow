import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: 'GateFlow API running',
      docs: '/docs',
      health: '/health',
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'gateflow-api',
      timestamp: new Date().toISOString(),
    };
  }
}
