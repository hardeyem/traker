import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { ConfigModule } from '@nestjs/config';
import { RepositoryModule } from './repository/repository.module';
import { MongooseModule } from '@nestjs/mongoose';
import { WebsocketModule } from './websocket/websocket.module';

import config from './core/config/config';
import databaseConfig from './core/config/database';
import { TestDatabaseModule } from '../test/database-in-memory';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config, databaseConfig ],
    }),
    // MongooseModule.forRoot(databaseConfig().dbUrl, {
    //   poolSize: 10,
    //   keepAlive: true,
    //   socketTimeoutMS: 0,
    //   useNewUrlParser: true, 
    //   useUnifiedTopology: true
    // }),
    TestDatabaseModule,
    CoreModule, 
    SharedModule, 
    RepositoryModule,
    ApiModule,
    WebsocketModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
