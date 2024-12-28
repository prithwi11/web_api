import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

const methodNotAllowed = (req: Request, res: Response, next: NextFunction) => global.Helpers.methodNotAllowedStatusBuild(res, 'Method not allowed');

import { IncomeMiddleware } from '../middleware/income-middleware';
const incomeMiddleware = new IncomeMiddleware();

import { IncomeController } from '../controller/income-controller';
import { CommonMiddleware } from '../../helper/common_middleware';
const commonMiddleware = new CommonMiddleware();
const incomeController = new IncomeController();
/* import { CommonMiddleware } from '../../../helper/common_middleware';
const commonmiddleware = new CommonMiddleware(); */

let middleware: any[] = [];

middleware = [
    incomeMiddleware.addIncome(),
    commonMiddleware.checkforerrors
]

router
    .route("/add-income")
    .post(middleware, incomeController.addIncome)
    .all(methodNotAllowed)

export const income_routing = router

