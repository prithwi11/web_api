import { UserModel } from "../model/user_model";
import { IUserRegistrationRequest, IUserLoginRequest } from "../interface/user_interface";

export class UserService {
    private _userModel = new UserModel();

    //INITIALIZE LOG OBJECT
    initLog() {
        global.logs.logObj.file_name = "V1-UserService";
        global.logs.logObj.application = global.path.dirname(__filename) + global.path.basename(__filename)
    }

    registrationService = async(reqBody: IUserRegistrationRequest) => {
        this.initLog();
        const api_name_with_trace_id: string = "registrationService" + global.Helpers.getTraceID(reqBody);
        global.logs.writelog(api_name_with_trace_id, ['Request: ', reqBody]);

        try {
            let response_dataset: any = {};
            //check if email exists
            let checkValidEmail = await this._userModel.countAllByAny({where: {email: reqBody.email}});
            global.logs.writelog(api_name_with_trace_id, ['checkValidEmail: ', checkValidEmail]);
            if (checkValidEmail > 0) {
                return global.Helpers.makeBadServiceStatus("Email already exists");
            }

            let insertUserObj: any = {
                name: reqBody.name,
                email: reqBody.email,
                password_hash: reqBody.password
            }
            let insertUser: any = await this._userModel.addNewRecord(insertUserObj);
            global.logs.writelog(api_name_with_trace_id, ["insertUser", insertUser]);

            response_dataset.id = insertUser.id;
            return global.Helpers.makeSuccessServiceStatus("User created successfully", response_dataset);

        }
        catch (error: any) {
            console.log(error)
            global.logs.writelog(api_name_with_trace_id, ['Error: ', error]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later!");
        }
    }

    loginService = async(reqBody: IUserRegistrationRequest) => {
        this.initLog();
        const api_name_with_trace_id: string = "loginService" + global.Helpers.getTraceID(reqBody);
        global.logs.writelog(api_name_with_trace_id, ['Request: ', reqBody]);

        try {
            let response_dataset: any = {};
            //check if email exists
            let checkValidEmail = await this._userModel.countAllByAny({where: {email: reqBody.email}});
            global.logs.writelog(api_name_with_trace_id, ['checkValidEmail: ', checkValidEmail]);
            if (checkValidEmail > 0) {
                return global.Helpers.makeBadServiceStatus("Email doesn'ts exists");
            }

            let checkValidPassword = await this._userModel.countAllByAny({where: {email: reqBody.email, password: reqBody.password}});

            let insertUserObj: any = {
                name: reqBody.name,
                email: reqBody.email,
                password: reqBody.password
            }
            let insertUser: any = await this._userModel.addNewRecord(insertUserObj);
            global.logs.writelog(api_name_with_trace_id, ["insertUser", insertUser]);

            response_dataset.id = insertUser.id;
            return global.Helpers.makeSuccessServiceStatus("User created successfully", response_dataset);

        }
        catch (error: any) {
            global.logs.writelog(api_name_with_trace_id, ['Error: ', error]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later!");
        }
    }
}