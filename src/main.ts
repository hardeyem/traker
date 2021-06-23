import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as path from 'path';
import * as morgan from 'morgan';
import * as rateLimit from 'express-rate-limit';
import { createStream } from 'rotating-file-stream';

import { AppLogger } from './core';
import config from './core/config/config';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {
  // create a rotating write stream for log
  const accessLogStream = createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(path.dirname(__dirname), 'log')
  });

  const CONFIG = config();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new AppLogger()
  })
  // app.useWebSocketAdapter(new IoAdapter(httpServer));

  app.use(
    rateLimit({
      windowMs: 1000, // 1sec
      max: 10000, // limit each IP to 100 requests per windowMs
    })
  );

  // request access logging
  app.use(morgan('combined', { stream: accessLogStream }));
  app.use(morgan('combined'));

  app.disable('x-powered-by');
  app.enableCors();

  await app.listenAsync(CONFIG.port);
}
bootstrap();
