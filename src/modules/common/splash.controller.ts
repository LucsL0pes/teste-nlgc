import { Controller, Get, Render, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class SplashController {
  @Get('/')
  @Render('splash')
  showSplash(@Req() req: Request) {
    return {
      baseUrl  : req.baseUrl || '',
      jaLogado : Boolean((req.cookies as any)?.user),
    };
  }
}
