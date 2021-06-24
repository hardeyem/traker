import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetSchema } from './schemas/asset';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Asset', schema: AssetSchema },
        ])
    ],

    exports: [
        MongooseModule
    ]
})
export class RepositoryModule {}
