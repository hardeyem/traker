import { IsNumber, IsString } from "class-validator";

export class AddAssetDTO{
    @IsString() assetId: string;
}

export class AssetLocationUpdateDTO{
    @IsNumber() latitude: number;
    @IsNumber() longitude: number;
    @IsString() address: string;
}