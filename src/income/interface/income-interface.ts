export interface IAddIncomeRequest {
    income_id?: number,
    user_id: number,
    amount: number,
    title: string,
    credit_date: Date,
}