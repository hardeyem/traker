import { Module } from '@nestjs/common';
import { CoreModule } from 'src/core';
import { RepositoryModule } from 'src/repository/repository.module';
import { SharedModule } from 'src/shared/shared.module';
import { AssetController } from './asset/asset.controller';

@Module({
  imports: [
    CoreModule,
    SharedModule,
  ],
  controllers: [AssetController]
})
export class ApiModule {}
