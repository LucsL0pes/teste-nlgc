import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.use(cookieParser());
    app.use('/public', express.static(join(__dirname, '..', 'src', 'public')));
    app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
    app.setViewEngine('ejs');
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(/Bem-vindo/);
  });
});
