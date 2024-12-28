import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import pathModule from 'path';
import morgan from "morgan";
import { winstonlog } from './configuration/winston';
import { LOGGER_SETTINGS } from './configuration/log_config';
import dotenv from "dotenv";
dotenv.config();
import { common_helper } from "./helper/common_helper";
import { helperConfig } from "./helper/helper_config";
import { Encryption } from "./helper/encrypt_decrypt_helper";
import cors from 'cors';
import helmet from 'helmet';
import { Config } from "./configuration/config";

declare global {
    var Helpers: typeof global_helper;
    var logs: typeof winlog;
    var path: typeof pathModule;
    var helper_config: typeof helperConfig;
    var encrypt_decrypt_helper: typeof encrypt_decypt_helper;
    var encrypt_decrypt_helper: typeof encrypt_decypt_helper;
    var connectionObj: Sequelize;
}
global.connectionObj = new Config().connectDB();//Use DB connections

let winlog = new winstonlog(LOGGER_SETTINGS);//====>LOGGER_SETTING From env or some other file
let global_helper = new common_helper();
let encrypt_decypt_helper = new Encryption({
    algorithm: process.env.CRYPT_ALGO as string,
    encryptionKey: process.env.ENCRYPT_KEY as string,
    salt: process.env.SALT,
    iv: process.env.IV as string
})
global.Helpers = global_helper;
global.helper_config = helperConfig;
global.encrypt_decrypt_helper = encrypt_decypt_helper;
global.logs = winlog;
global.path = pathModule;//Use global,dotenv before importing route
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :remote-user [:date[iso]] :total-time[5] ms', { stream: { write: message => global.logs.logger.info(message) } }));
//=========================Helmet==================
app.use(helmet());
// Sets "Content-Security-Policy: default-src 'none';
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'none'"]
        },
    })
);
// Sets "X-Frame-Options: DENY"
app.use(
    helmet.frameguard({
        action: "deny",
    })
);
// Sets "X-Content-Type-Options: nosniff"
app.use(helmet.noSniff());
// Removes the X-Powered-By header if it was set.
app.use(helmet.hidePoweredBy());

//============End==============//

app.use(cookieParser());
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));
app.use(express.static(pathModule.join(__dirname, 'public')));
app.set('views', pathModule.join(__dirname, './views'));
app.set('view engine', 'ejs');

/*********ALLOW CORS***********/
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}));
/**********END**********/

import { app_route } from "./app_routing";
import { CommonMiddleware } from "./helper/common_middleware";
import { Sequelize } from "sequelize";
const common_middleware_obj = new CommonMiddleware();
app.use(common_middleware_obj.decryptFromdata);
app.use('/v1', app_route);

const PORT = process.env.PORT; // 3000;
winlog.initiateLoggingSystem();
app.get("/", (req, res) => {
    // render the index template
    res.render("error");
});

// catch 404 and forward to error handler
// app.use('/', app_route)
//End

app.listen(PORT, () => {
    console.info(`App listening on port ${PORT}`)
});