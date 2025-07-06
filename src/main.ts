import { NestFactory } from '@nestjs/core';
import { AppModule }   from './app.module';
import * as cookieParser from 'cookie-parser';
import * as express      from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use('/public',  express.static('public'));
  app.use('/favicon.ico', (_,_res)=>_res.sendStatus(204));  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
