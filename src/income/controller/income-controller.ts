import { Request, Response } from "express";
import { IncomeService } from "../service/income-service";

export class IncomeController {
    private _incomeService = new IncomeService();
    
    initLog() {
        global.logs.logObj.file_name = "V1-IncomeController";
        global.logs.logObj.application = global.path.dirname(__filename) + global.path.basename(__filename);
    }

    addIncome = async(request: Request, response: Response) => {
        this.initLog();
        const api_name_with_trace_id = 'addIncome' + global.Helpers.getTraceID(request.body);

        try {
            let addIncome = await this._incomeService.addIncomeService(request.body);
            global.logs.writelog(api_name_with_trace_id, ['addIncome: ', addIncome]);
            if(addIncome.status) {
                return global.Helpers.successStatusBuild(response, addIncome, addIncome.status_message);
            }
            else {
                return global.Helpers.badRequestStatusBuild(response, addIncome.status_message);
            }
        }
        catch (error: any) {
            console.log(error.stack)
            global.logs.writelog(api_name_with_trace_id, ['ERROR:', error.stack]);
            global.Helpers.badRequestStatusBuild(response, 'Something went wrong. Please try again.');
        }
    }

}