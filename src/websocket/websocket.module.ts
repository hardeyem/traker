import { Module } from '@nestjs/common';
import { CoreModule } from 'src/core';
import { SharedModule } from 'src/shared/shared.module';
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