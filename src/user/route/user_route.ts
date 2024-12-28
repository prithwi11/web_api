import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

const methodNotAllowed = (req: Request, res: Response, next: NextFunction) => global.Helpers.methodNotAllowedStatusBuild(res, 'Method not allowed');

import { UserMiddleware } from '../middleware/user_middleware';
const userMiddleware = new UserMiddleware();

import { UserController } from '../controller/user_controller';
import { CommonMiddleware } from '../../helper/common_middleware';
const commonMiddleware = new CommonMiddleware();
const userController = new UserController();
/* import { CommonMiddleware } from '../../../helper/common_middleware';
const commonmiddleware = new CommonMiddleware(); */

let middleware: any[] = [];

middleware = [
    userMiddleware.registrationVaidate(),
    commonMiddleware.checkforerrors
]

router
    .route("/registration")
    .post(middleware, userController.registration)
    .all(methodNotAllowed)

middleware = [
    userMiddleware.loginValidate(),
    commonMiddleware.checkforerrors
]

router
    .route("/login")
    .post(middleware, userController.login)
    .all(methodNotAllowed)

export const user_routing = router

