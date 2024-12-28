import dotenv from "dotenv";
dotenv.config();

export const Validator = {
    common_regex: /^[a-zA-Z0-9 \u00C0-\u00ff().,@/=*#&!?%:;"'’_\n\r-+-|]+$/
}
