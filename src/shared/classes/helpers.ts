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
    static sendJsonResponse (res: Response, data: any, message: string, status = HttpStatus.OK, code = 200) {
        const resData = {
            success: true,
            code,
            message,
            data: data
        };
        return res.status(status).json(resData);
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

    /**
     * Throttle a function call based on sepcify duration
     * @param duration 
     * @param callback 
     * @returns 
     */
    static throttle(duration, callback){
        return function(){
            const context = this;
            setTimeout(()=> {
                callback.apply(context);
            }, duration);
        }
    }

    /**
     * validate and object against required parameters
     * @param obj 
     * @param requiredParam {name: string, type: string}
     * @returns {success: boolean, message: string[]}
     */
    static validParam(obj, requiredParam) {
        const objKeys = Object.keys(obj);
        const failed = [];
        let success = true;
    
        requiredParam.forEach((param, index) => {
            const idx = objKeys.findIndex(k => {
                return k === param.name;
            });
    
            if (idx < 0) {
                failed.push(`${param.name} not found`);
                success = false;
            } else if (param.type && (typeof obj[param.name] != param.type)) {
                failed.push(`${param.name} should be ${param.type}`);
                success = false;
            }

            if(typeof obj[param.name] == "string" && obj[param.name].trim() == ""){
                failed.push(`${param.name} is empty`);
                success = false;
             }
        });
    
        return {
            success: success,
            message: failed
        };
    };
}