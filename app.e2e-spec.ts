import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './src/app.module';

fdescribe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule
      ],
    }).compile();

    app = await moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  fit('/ (GET)', async (done) => {
    try{
      const getHome = await request(app.getHttpServer())
      .get('/');
      expect(getHome.statusCode).toBe(200);
      expect(getHome.text).toBe('Hello World!');

      done();
    }catch(error){
      done.fail(error);
    }
    
  });
});
