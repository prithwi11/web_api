import { statusBuild } from "./common_interface";
import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import multiparty from "multiparty";
import { jWT_helper } from "../helper/jwt_helper";
import * as jwt from 'jsonwebtoken'


export class CommonMiddleware {
    private api_var: {
        'version': string,
        'developer': string
    };
    // private _roleResourceOperationsMappingModel = new RoleResourceOperationsMappingModel();
    // private _userDetailsModel = new UserDetailsModel();
    constructor() {

        this.api_var = {
            'version': process.env.VERSION as string,
            'developer': process.env.API_DEVELOPER as string
        }

    }

    initLog() {
        global.logs.logObj.file_name = "V1-CommonMiddleware";
        global.logs.logObj.application = global.path.dirname(__filename) + global.path.basename(__filename);
    }

    /**
     * @developer : Prithwiraj Bhadra
     * @date : 26-07-2023
     * @description : 
    */
    public validateFormData = async (req: Request, res: Response<{}>, next: NextFunction): Promise<void> => {
        let localObj: object = {};
        localObj = req.body;
        var checkMultiparty: number = 0
        if (Object.keys(req.body).length == 0) {
            //ONLY LOGIN DETAILS EXIST
            checkMultiparty = 1;
        }

        if (checkMultiparty == 1) {
            var checkform = (callback: any) => {
                var sendData: { [key: string]: object } = {};
                var form = new multiparty.Form();
                form.parse(req, function (err: Error | null, fields: { [key: string]: any }, files: { [key: string]: any }) {
                    if (typeof (fields) != 'undefined') {
                        if (Object.keys(fields).length > 0) {
                            Object.keys(fields).forEach(function (key: string) {
                                sendData[key] = fields[key][0];
                            });
                        }
                    }
                    else {
                        global.Helpers.notAcceptableStatusBuild(res, 'Content type mismatch');
                        return;
                    }

                    if (typeof (files) != 'undefined') {
                        if (Object.keys(files).length > 0) {
                            Object.keys(files).forEach(function (key: string) {
                                sendData[key] = files[key];
                            });
                        }
                    }
                    else {
                        global.Helpers.notAcceptableStatusBuild(res, 'Content type mismatch');
                        return;
                    }
                    callback(sendData);
                });
            }
            var callbackfun = (sendData: { [key: string]: any }) => {
                req.body = sendData;
                next();
            }
            checkform(callbackfun);
        }
        else {
            next();
        }
    }
    /**
     * @developer : Prithwiraj Bhadra
     * @date : 26-07-2023
     * @description : 
    */
    public checkforerrors = async (req: object, res: statusBuild, next: NextFunction): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let response_status: { [key: string]: any } = {};
            let response_dataset = {};
            let response_data: { [key: string]: any } = {};
            let errorVal = errors.array();
            response_dataset = errors.array();
            response_status.msg = errorVal[0].msg.toLowerCase();
            response_status.msg = response_status.msg.charAt(0).toUpperCase() + response_status.msg.slice(1);

            response_status.action_status = false;
            response_data.data = response_dataset;
            response_data.status = response_status;
            response_data.publish = this.api_var;

            if (errorVal[0].msg == 'Please update your app.') {
                res.status(401);
            } else {
                res.status(400);
            }
            res.send({ response: response_data });
        } else {
            next();
        }
    }

    /**
     * @developer : Prithwiraj Bhadra
     * @date : 26-07-2023
     * @description : Token validation
    */

    public validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        let token = req.headers['authorization'];
        if (token) {
            if (token.startsWith('Bearer ') || token.startsWith('bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            let validToken = new jWT_helper();
            // decode token
            if (token) {
                validToken.verifyToken(token)
                    .then(async jwtDecres => {
                        req.body.loginDetails = jwtDecres;
                        next()
                    }).catch(async err => {
                        // global.Helpers.unauthorizedStatusBuild(res, 'Unauthorized token');
                        global.Helpers.unauthorizedStatusBuild(res, 'Session expired!');
                    });
            } else {
                // global.Helpers.unauthorizedStatusBuild(res, 'Token Undefined');
                global.Helpers.unauthorizedStatusBuild(res, 'Session expired!');
            }
        } else {
            // global.Helpers.unauthorizedStatusBuild(res, 'Unauthorized token');
            global.Helpers.unauthorizedStatusBuild(res, 'Session expired!');
        }
    }

    validateRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
        let token = req.body.refresh_token;
        if (token) {
            if (token.startsWith('Bearer ') || token.startsWith('bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            token = await global.Helpers.tokenDecrypt(token);

            // decode token
            if (token) {
                this.verifyRefreshToken(token)
                    .then(async (jwtDecres: any) => {
                        req.body.refToken_loginDetails = jwtDecres.param;
                        next()
                    }).catch(async err => {
                        global.Helpers.unauthorizedStatusBuild(res, 'Session expired!');
                    });
            } else {
                global.Helpers.unauthorizedStatusBuild(res, 'Session expired!');
            }
        } else {
            global.Helpers.unauthorizedStatusBuild(res, 'Session expired!');
        }
    }

    validateExpiredToken = async (req: Request, res: Response, next: NextFunction) => {
        let token: string = req.headers['authorization'] as string;
        if (token) {
            if (token.startsWith('Bearer ') || token.startsWith('bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
                token = await global.Helpers.tokenDecrypt(token);
            }

            // decode token
            if (token) {
                this.ExpverifyToken(token)
                    .then(async jwtDecres => {
                        const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
                        if ((Math.floor((new Date).getTime() / 1000)) >= expiry) {
                            var ca = token as string;
                            var base64Url = ca.split('.')[1];
                            var decodedValue = JSON.parse(atob(base64Url));
                            req.body.expired_loginDetails = decodedValue;
                            next();
                        } else if ((Math.floor((new Date).getTime() / 1000)) < expiry) {
                            req.body.valid_loginDetails = jwtDecres;
                            next();
                        }
                    }).catch(async err => {
                        global.Helpers.unauthorizedStatusBuild(res, 'Session expired!');
                    });
            } else {
                global.Helpers.unauthorizedStatusBuild(res, 'Session expired!');
            }
        } else {
            global.Helpers.unauthorizedStatusBuild(res, 'Session expired!');
        }
    }

    // For Refresh Token Verify
    verifyRefreshToken(token: string) {
        return new Promise(function (resolve, reject) {
            jwt.verify(token, process.env.REFRESH_TOKEN_KEY as string, process.env.JWT_ALGORITHM as any, function (err, result) {
                if (result)
                    return resolve(result);
                else
                    return reject(err);
            });
        });
    }

    // For Expired Token Verify
    ExpverifyToken(token: string) {
        return new Promise(function (resolve, reject) {
            jwt.verify(token, process.env.JWT_SECRET as string, process.env.JWT_ALGORITHM as any, function (err: any, result) {
                if (result)
                    return resolve(result);
                else
                    if (err?.message == "jwt expired") {
                        return resolve(token);
                    } else {
                        return reject(err);
                    }
            });
        });
    }

    public decryptFromdata = async (req: Request, res: Response, next: NextFunction) => {
        if (req.body.enc_data) {
            if (req.headers['content-type'] == 'application/json') {
                if (process.env.ENCRYPTED_DATA == '1') {
                    req.body = JSON.parse(await global.encrypt_decrypt_helper.decryptRequest(req.body.enc_data)) || {};
                }
            }
        }
        next();
    }

    /* public checkAllPermission = async (req : Request, res : Response, next : NextFunction) => {
        this.initLog();
        const apiname_with_trace_id: string = 'checkAllPermission' + global.Helpers.getTraceID(req.body);

        try{
            if (process.env.CHECK_ALL_PERMISSION == "1") {
                let pattern = /^[0-9]*$/
                if(!req.body.action_id || !pattern.test(req.body.action_id) || req.body.action_id < 0){
                    return global.Helpers.forbiddenRequestStatusBuild(res,"Access denied.");
                }
                let userId:any= global.Helpers.decryptId(req.body.loginDetails.verifiedData.param.user_id);
                let action_id : number = req.body.action_id
                let find_permission_json :any= await this._userDetailsModel.userPermissionDetail(userId);
                global.logs.writelog(apiname_with_trace_id,['find_permission_json', find_permission_json]);


                if(!find_permission_json || find_permission_json.role.dataValues.permission_details == null){
                    return global.Helpers.forbiddenRequestStatusBuild(res,"Access denied.")
                }
                let res_data = JSON.parse(JSON.stringify(find_permission_json));
                
                let Access = false;
                for(let ele  of res_data.role.permission_details){
                    // FOR MAIN MANU
                    if(ele.action.length > 0){
                        for(let actions  of ele.action){
                            if(actions.action_id == action_id && actions.value){
                                Access = true
                            }
                        }
                    }
                    // FOR SUB MANU
                    if(ele.sub_menu.length > 0 ){
                        for(let sub_menus  of ele.sub_menu){
                            // IF ACTIONS PRESENT
                            if(sub_menus.action.length >0 ){
                                for(let actions  of sub_menus.action){
                                    // IF ACTIONS PRESENT
                                    if(actions.action_id == action_id && actions.value){
                                        Access = true
                                    }
                                    
                                }
                            }
                        }
                    }
                }
                if(Access){
                    next();
                }else{
                    return global.Helpers.forbiddenRequestStatusBuild(res,"Access denied.")
                }
            } else {
                next();
            }
        }catch(e: any){
            global.logs.writelog(apiname_with_trace_id,['Error :', e.stack]);
            return global.Helpers.forbiddenRequestStatusBuild(res,"Access denied.")
        }
	} */

    /* public checkAllPermissionForBoth = async (req : Request, res : Response, next : NextFunction) => {
        try{
            if ([1, 2, 3].includes(req.body.loginDetails.verifiedData.param.user_type) && (!req.body.action_id || req.body.action_id == '')) {
                next();
            }
            else if (process.env.CHECK_ALL_PERMISSION == "1") {
                let pattern = /^[0-9]*$/
                if(!req.body.action_id || !pattern.test(req.body.action_id) ||req.body.action_id < 0){
                    return global.Helpers.forbiddenRequestStatusBuild(res,"Access denied.");
                }
                let userId:any= global.Helpers.decryptId(req.body.loginDetails.verifiedData.param.user_id);
                let action_id : number = req.body.action_id
                let find_permission_json :any= await this._roleResourceOperationsMappingModel.findByAnyOne({
                    attributes:['role_res_op_mp_id','permission_details'],
                    where :{
                        fk_auth_user_id : userId
                    }
                });
                if(!find_permission_json || find_permission_json.dataValues.permission_details == null){
                    return global.Helpers.forbiddenRequestStatusBuild(res,"Access denied.");
                }
                let res_data = JSON.parse(JSON.stringify(find_permission_json));
                
                let Access = false;
                for(let ele  of res_data.permission_details){
                    // FOR MAIN MANU
                    if(ele.action.length > 0){
                        for(let actions  of ele.action){
                            if(actions.action_id == action_id && actions.value){
                                Access = true
                            }
                        }
                    }
                    // FOR SUB MANU
                    if(ele.sub_menu.length > 0 ){
                        for(let sub_menus  of ele.sub_menu){
                            // IF ACTIONS PRESENT
                            if(sub_menus.action.length >0 ){
                                for(let actions  of sub_menus.action){
                                    // IF ACTIONS PRESENT
                                    if(actions.action_id == action_id && actions.value){
                                        Access = true
                                    }
                                    
                                }
                            }
                        }
                    }
                }
                if(Access){
                    next();
                }else{
                    return global.Helpers.forbiddenRequestStatusBuild(res,"Access denied.")
                }
            } else {
                next();
            }
        }catch(e){
            return global.Helpers.forbiddenRequestStatusBuild(res,"Access denied.")
        }
	} */

}