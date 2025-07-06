import { NestFactory } from '@nestjs/core';
import { AppModule }   from './app.module';
import * as cookieParser from 'cookie-parser';
import * as express      from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use('/public',  express.static('public'));
  app.use('/favicon.ico', (_,_res)=>_res.sendStatus(204));
  app.setBaseViewsDir(join(__dirname, 'views'));
  app.setViewEngine('ejs');
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
