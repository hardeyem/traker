import { Module } from '@nestjs/common';
import { CoreModule } from '../core';
import { SharedModule } from '../shared';
import { EventGateway } from './event-gateway';

@Module({
    imports: [
        SharedModule,
        CoreModule
    ],
    providers: [EventGateway],
    exports: [EventGateway]
})
export class WebsocketModule {}