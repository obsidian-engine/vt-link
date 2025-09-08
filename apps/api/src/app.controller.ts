import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'ヘルスチェック' })
  @ApiResponse({ status: 200, description: 'API動作確認' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'ヘルスチェック' })
  @ApiResponse({ status: 200, description: 'API動作確認' })
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }
}