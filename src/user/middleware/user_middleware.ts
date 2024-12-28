import { check } from "express-validator";

export class UserMiddleware {
    registrationVaidate() {
        return [
            check('name').trim().not().isEmpty().withMessage("Please provide name"),
            check('email').trim().not().isEmpty().withMessage("Please provide email").isEmail().withMessage("Please provide valid value in email"),
            check('password').trim().not().isEmpty().withMessage("Please provide password")
        ]
    }
    loginValidate() {
        return [
            check('email').trim().not().isEmpty().withMessage("Please provide email").isEmail().withMessage("Please provide valid value in email"),
            check('password').trim().not().isEmpty().withMessage("Please provide password")
        ]
    }
}