import { IAddIncomeRequest } from "../interface/income-interface";
import { IncomeModel } from "../model/model.income";

export class IncomeService {
    private _incomeModel = new IncomeModel();

    //INITIALIZE LOG OBJECT
    initLog() {
        global.logs.logObj.file_name = "V1-IncomeService";
        global.logs.logObj.application = global.path.dirname(__filename) + global.path.basename(__filename)
    }

    addIncomeService = async(reqBody: IAddIncomeRequest) => {
        this.initLog();
        const api_name_with_trace_id: string = "addIncomeService" + global.Helpers.getTraceID(reqBody);
        global.logs.writelog(api_name_with_trace_id, ['Request: ', reqBody]);
        try {
            let response_dataset: any = {};
            let incomeObj: any = {
                fk_user_id: reqBody.user_id,
                amount: reqBody.amount,
                title: reqBody.title,
                credit_date: reqBody.credit_date
            };
            if (reqBody.income_id == 0) { //add income
                const addIncome: any = await this._incomeModel.addNewRecord(incomeObj);
                global.logs.writelog(api_name_with_trace_id, ["addIncome: ", addIncome]);
                response_dataset.id = addIncome.id;

                return global.Helpers.makeSuccessServiceStatus("Income added successfully", response_dataset);
            }
            else { //update income
                const updateIncome: any = await this._incomeModel.updateAnyRecord(incomeObj, {where: {id: reqBody.income_id}});
                global.logs.writelog(api_name_with_trace_id, ["updateIncome: ", updateIncome]);
                response_dataset.id = reqBody.income_id;

                return global.Helpers.makeSuccessServiceStatus("Income updated successfully", response_dataset);
            }
        }
        catch (error: any) {
            console.log(error)
            global.logs.writelog(api_name_with_trace_id, ['Error: ', error]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later!");
        }
    }
}