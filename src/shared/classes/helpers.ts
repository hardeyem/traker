import { HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { ResponseData} from './interfaces';

export class UtiliHelpers {


    /**
     * Sends JSON success resonse to client
     * @param {*} code
     * @param {*} data
     * @param {*} message
     * @param {*} code
     */
    static sendJsonResponse (res: Response, data: any, message: string, code = 200) {
        const resData = {
            success: true,
            code,
            message,
            data: data
        };
        return res.status(HttpStatus.OK).json(resData);
    }

    /**
     * Sends JSON error resonse to client
     * @param {*} data
     * @param {*} message
     * @param {*} status
     * @param {*} code
     */
    static sendErrorResponse (data: any, message: string, status: number, code: number): ResponseData {
        const resData = {
            success: false,
            code,
            message,
            data: data
        }

        throw new HttpException(resData, status)
    }
}