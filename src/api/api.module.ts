import { Module } from '@nestjs/common';
import { CoreModule } from '../core';
import { SharedModule } from '../shared';
import { WebsocketModule } from '../websocket';
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
