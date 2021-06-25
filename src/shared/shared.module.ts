import { Module } from '@nestjs/common';
import { RepositoryModule } from 'src/repository/repository.module';
import { AssetService } from './services/asset/asset.service';
import { UtilityService } from './utility/utility.service';
import { ConnectedUserService } from './services/connected-user/connected-user.service';

@Module({
  imports: [RepositoryModule],
  exports: [
    AssetService,
    ConnectedUserService
  ],
  providers: [AssetService, UtilityService, ConnectedUserService]
})
export class SharedModule {}
