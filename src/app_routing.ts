import express from "express";
const app = express();
app.disable('x-powered-by')


import { user_routing } from "./user/route/user_route";
app.use('/users', user_routing);
export const app_route = app;