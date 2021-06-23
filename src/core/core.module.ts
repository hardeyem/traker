import { Module } from '@nestjs/common';
import { AppLogger } from './logger/logger';

@Module({
    providers: [AppLogger],
    exports: [AppLogger]
})
export class CoreModule {}
