import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetSchema } from './schemas/asset';
import { ConnectedUsersSchema } from './schemas/connected.user';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Asset', schema: AssetSchema },
            { name: 'ConnectedUser', schema: ConnectedUsersSchema },
        ])
    ],

    exports: [
        MongooseModule
    ]
})
export class RepositoryModule {}
