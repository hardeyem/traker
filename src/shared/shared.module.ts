import { Module } from '@nestjs/common';
import { RepositoryModule } from 'src/repository/repository.module';
import { AssetService } from './services/asset/asset.service';

@Module({
  imports: [RepositoryModule],
  exports: [
    AssetService
  ],
  providers: [AssetService]
})
export class SharedModule {}
