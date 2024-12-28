import express from "express";
const app = express();
app.disable('x-powered-by')


import { user_routing } from "./user/route/user_route";
import { income_routing } from "./income/routes/income-route";

app.use('/users', user_routing);
app.use('/income', income_routing);

export const app_route = app;