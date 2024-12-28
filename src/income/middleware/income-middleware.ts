import { check } from "express-validator";

export class IncomeMiddleware {
    addIncome() {
        return [
            check("user_id").not().isEmpty().withMessage("Please enter user id"),
            check("amount").not().isEmpty().withMessage("Please enter amount").isNumeric().withMessage("Amount must be a number"),
            check("title").not().isEmpty().withMessage("Please enter a title"),
            check("credit_date").not().isEmpty().withMessage("Please enter a date")
        ]
    }
}