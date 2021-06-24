import { Body, Controller, Post, Request, Get, Response, HttpStatus, Param, Put } from '@nestjs/common';
import { AppLogger } from 'src/core';
import { UtiliHelpers } from 'src/shared/classes/helpers';
import { AddAssetDTO, AssetLocationUpdateDTO } from 'src/shared/dtos/asset.dto';
import { AssetService } from 'src/shared/services/asset/asset.service';

/**
 * Asset Controller exposes asset based endpoint
 */
@Controller('asset')
export class AssetController {

    constructor(
        private assetSvc: AssetService,
        private logger: AppLogger,

    ) {}

    /**
     * Add new asset 
     * @param req 
     * @param res 
     * @param body 
     * @returns 
     */
    @Post('')
    async addAsset(@Request() req, @Response() res, @Body() body: AddAssetDTO){

        try {
            const asset = await this.assetSvc.addAsset(body);   
            return UtiliHelpers.sendJsonResponse(res, {asset}, 'Asset created', HttpStatus.CREATED);
        } catch (error) {
            this.logger.error(error.toString(), error);
        }

        return UtiliHelpers.sendErrorResponse({}, 'Error adding asset', HttpStatus.BAD_REQUEST, 100);

    }

    /**
     * Update asset location
     * @param req 
     * @param res 
     * @param params 
     * @param body 
     * @returns 
     */
    @Put(':assetId/updateLocation')
    async updateAssetLocation(@Request() req, @Response() res, @Param() params, @Body() body: AssetLocationUpdateDTO){
        try {
            await this.assetSvc.updateLocation(params.assetId, body);
            return UtiliHelpers.sendJsonResponse(res, {}, 'Asset Location updated', HttpStatus.CREATED);
        } catch (error) {
            this.logger.error(error.toString(), error);
        }

        return UtiliHelpers.sendErrorResponse({}, 'Error getting all assets', HttpStatus.BAD_REQUEST, 101);
    }

    /**
     * Get all assets 
     * @param req 
     * @param res 
     * @returns 
     */
    @Get('')
    async getAllAsset(@Request() req, @Response() res){
        try {
            const assets = await this.assetSvc.getAllAssets();
            return UtiliHelpers.sendJsonResponse(res, {assets}, 'Got assest', HttpStatus.CREATED);
        } catch (error) {
            this.logger.error(error.toString(), error);
        }

        return UtiliHelpers.sendErrorResponse({}, 'Error getting all assets', HttpStatus.BAD_REQUEST, 101);
    }
    
    /**
     * Get asset by assest id
     * @param req 
     * @param res 
     * @param params 
     * @returns 
     */
    @Get(':assetId')
    async getByAssetId(@Request() req, @Response() res, @Param() params){
        try {
            const assets = await this.assetSvc.getByAssetId(params.assetId);
            return UtiliHelpers.sendJsonResponse(res, {assets}, 'Got assest', HttpStatus.CREATED);
        } catch (error) {
            this.logger.error(error.toString(), error);
        }

        return UtiliHelpers.sendErrorResponse({}, 'Error getting all assets', HttpStatus.BAD_REQUEST, 101);
    }
}
