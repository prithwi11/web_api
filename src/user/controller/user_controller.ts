import { Request, Response } from "express";
import { UserService } from "../service/user_service";

export class UserController {
    private _userService = new UserService();
    
    initLog() {
        global.logs.logObj.file_name = "V1-UserController";
        global.logs.logObj.application = global.path.dirname(__filename) + global.path.basename(__filename);
    }

    registration = async(request: Request, response: Response) => {
        this.initLog();
        const api_name_with_trace_id = 'registration' + global.Helpers.getTraceID(request.body);

        try {
            let addUser = await this._userService.registrationService(request.body);
            global.logs.writelog(api_name_with_trace_id, ['addUser: ', addUser]);
            if(addUser.status) {
                return global.Helpers.successStatusBuild(response, addUser, addUser.status_message);
            }
            else {
                return global.Helpers.badRequestStatusBuild(response, addUser.status_message);
            }
        }
        catch (error: any) {
            global.logs.writelog(api_name_with_trace_id, ['ERROR:', error.stack]);
            global.Helpers.badRequestStatusBuild(response, 'Something went wrong. Please try again.');
        }
    }

    login = async(request: Request, response: Response) => {
        this.initLog();
        const api_name_with_trace_id = 'login' + global.Helpers.getTraceID(request.body);

        try {
            let loginUser = await this._userService.loginService(request.body);
            global.logs.writelog(api_name_with_trace_id, ['loginUser: ', loginUser]);
            if(loginUser.status) {
                return global.Helpers.successStatusBuild(response, loginUser, loginUser.status_message);
            }
            else {
                return global.Helpers.badRequestStatusBuild(response, loginUser.status_message);
            }
        }
        catch (error: any) {
            global.logs.writelog(api_name_with_trace_id, ['ERROR:', error.stack]);
            global.Helpers.badRequestStatusBuild(response, 'Something went wrong. Please try again.');
        }
    }
}