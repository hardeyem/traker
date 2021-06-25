import { Module } from '@nestjs/common';
import { CoreModule } from 'src/core';
import { RepositoryModule } from 'src/repository/repository.module';
import { SharedModule } from 'src/shared/shared.module';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { AssetController } from './asset/asset.controller';
import { ConnectedUserController } from './connected-user/connected-user.controller';

@Module({
  imports: [
    CoreModule,
    SharedModule,
    WebsocketModule
  ],
  controllers: [AssetController, ConnectedUserController]
})
export class ApiModule {}
