import moment from "moment-timezone";
import {
	statusBuild,
	response_object_detail,
	methodNotAllowed,
	FetchGraphQLDataOptions,
	mailData,
} from "./common_interface";
import { helperConfig } from "./helper_config";
import Cryptr from "cryptr";
import * as argon2 from "argon2";
import { jWT_helper } from './jwt_helper';
import axios from 'axios';
import  *  as ejs from "ejs";
// import { AuthClientsModel } from "../domain/user/model/model.auth_clients";
export class common_helper {
	private api_var: {
		'version': string,
		'developer': string
	};

	constructor() {
		this.api_var = {
			'version': process.env.VERSION as string,
			'developer': process.env.API_DEVELOPER as string
		};

	}

	initLog() {
		global.logs.logObj.file_name = "V1-CommonHelper";
		global.logs.logObj.application = global.path.dirname(__filename) + global.path.basename(__filename);
	}

	public getCurrentISTDate(): string {
		let utc = Date.now() / 1000;
		return moment.unix(utc).tz(process.env.TZ as string).format('YYYY-MM-DD');
	}

	public getCurrentISTDateTime(): string {
		const date = new Date();
		let mons = date.toLocaleString('default', { month: 'short' });
		const str_date: string = mons + " " + date.getDate() + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
		return str_date;
	}

	getCurrentTimestampUTCunix(): number {
		var utc = Math.floor(Date.now() / 1000)
		return utc;
	}

	getCurrentTimestampUTC() {
		let date = new Date();
		const dateNew = moment.utc(date, null as any).format('YYYY-MM-DD HH:mm:ss');
		return dateNew
	}

	getConvertTime(timeString: string) {
		// SPLIT THE TIME STRING INTO HOURS AND MINUTES
		var [hours, minutes] = timeString.split(':');

		// FORMAT THE TIME STRING
		var formattedTime = '';
		if (parseInt(hours) > 0) {
			formattedTime += parseInt(hours) + ' hr ';
		}
		formattedTime += minutes.toString().padStart(2, '0') + ' min';

		return formattedTime.trim(); // TRIM ANY EXTRA WHITESPACE
	}

	public successStatusBuild(res: statusBuild, dataset: object, msg: string): void {

		let response_status = {
			msg: msg,
			action_status: true
		};
		if (process.env.ENCRYPTED_DATA == '1') {
			dataset = {
				enc_data: global.encrypt_decrypt_helper.encryptResponse(JSON.stringify(dataset))
			}
		}
		let response_data: response_object_detail = {
			data: dataset,
			status: response_status,
			publish: this.api_var
		};

		res.status(helperConfig.HTTP_RESPONSE_OK);
		res.send({ response: this.capitalizeFirstLetter(response_data) });
	}

	public successStatusBuildForTallyApis(res: statusBuild, dataset: object, msg: string): void {

		let response_status = {
			msg: msg,
			action_status: true
		};
		let response_data: response_object_detail = {
			data: dataset,
			status: response_status,
			publish: this.api_var
		};

		res.status(helperConfig.HTTP_RESPONSE_OK);
		res.send({ response: this.capitalizeFirstLetter(response_data) });
	}

	public capitalizeFirstLetter(object: { [key: string]: any }): object {
		object.status.msg = object.status.msg.toLowerCase();
		object.status.msg = object.status.msg.charAt(0).toUpperCase() + object.status.msg.slice(1);
		return object
	}

	public badRequestStatusBuild(res: statusBuild, msg: string): void {
		let response_status = {
			msg: msg,
			action_status: false
		};
		let response_data: response_object_detail = {
			data: {},
			status: response_status,
			publish: this.api_var
		};

		res.status(helperConfig.HTTP_RESPONSE_BAD_REQUEST);
		res.send({ response: this.capitalizeFirstLetter(response_data) });
	}

	public forbiddenRequestStatusBuild(res: statusBuild, msg: string): void {
		let response_status = {
			msg: msg,
			action_status: false
		};
		let response_data: response_object_detail = {
			data: {},
			status: response_status,
			publish: this.api_var
		};

		res.status(helperConfig.HTTP_RESPONSE_FORBIDDEN);
		res.send({ response: this.capitalizeFirstLetter(response_data) });
	}

	public methodNotAllowedStatusBuild(res: methodNotAllowed, msg: string): void {
		let response_status = {
			msg: msg,
			action_status: false
		};
		let response_data: response_object_detail = {
			data: {},
			status: response_status,
			publish: this.api_var

		};

		res.setHeader('content-type', 'application/json');
		res.status(helperConfig.HTTP_RESPONSE_METHOD_NOT_ALLOWED);
		res.send({ response: this.capitalizeFirstLetter(response_data) });
	}

	public notAcceptableStatusBuild(res: statusBuild, msg: string): void {
		let response_status: { [key: string]: any } = {};
		let response_dataset: object[] = [];
		let response_data: { [key: string]: any } = {};
		response_status.msg = msg;
		response_status.action_status = false;
		response_data.data = response_dataset;
		response_data.status = response_status;
		response_data.publish = this.api_var;
		res.status(helperConfig.HTTP_RESPONSE_NOT_ACCEPTABLE);
		res.send({ response: this.capitalizeFirstLetter(response_data) });
	}

	public unauthorizedStatusBuild(res: statusBuild, msg: string) {
		let response_status: { [key: string]: any } = {};
		let response_dataset: { [key: string]: any } = [];
		let response_data: { [key: string]: any } = {};
		response_status.msg = msg;
		response_status.action_status = false;
		response_data.data = response_dataset;
		response_data.status = response_status;
		response_data.publish = this.api_var;
		res.status(helperConfig.HTTP_RESPONSE_UNAUTHORIZED);
		res.send({ response: this.capitalizeFirstLetter(response_data) });
	}

	getTraceID(reqbody: { [key: string]: any }) {
		if (reqbody.hasOwnProperty("loginDetails") && reqbody.loginDetails.hasOwnProperty("id")) {
			return ' - ' + reqbody.loginDetails.id;
		} else {
			return '';
		}
	}

	encryptId(id: string) {
		let cryptr = new Cryptr('1');
		const encryptedId = cryptr.encrypt(id);
		return encryptedId;
	}

	decryptId(id: string) {
		let cryptr = new Cryptr('1');
		const decryptedId = cryptr.decrypt(id);
		return decryptedId;
	}

	decryptObj(id: string) {
		let cryptr = new Cryptr('1');
		const decryptedId = cryptr.decrypt(id);
		return decryptedId;
	}

	async hashPassword(password: string) {
		const hash = await argon2.hash(password);
		return hash;
	}

	async comparePassword(password: string, hash: string) {
		if (await argon2.verify(hash, password)) {
			return true;
		} else {
			return false;
		}
	}

	escapeRegExp(string: string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	}

	FilterMatchEqual(text: string, searchvalue: string) {
		if (text == searchvalue) {
			return true;
		}
		else {
			return false;
		}
	}

	randomNumber4Dig() {
		var ranNum = Math.floor(1000 + Math.random() * 9000);
		return ranNum;
	}

	otpExpTime(otp_exp_time: string) {
		var date = new Date();
		let exp_time = otp_exp_time;
		exp_time = exp_time.substring(0, exp_time.length - 1);
		const dateNew = moment.utc(date).tz(process.env.TZ as string).add(exp_time, 'second').format('YYYY-MM-DD HH:mm:ss');
		return dateNew
	}

	getDateTimeOnlyWithFormat(date: Date | string, format_type: string) {
		var curdate = new Date(date);
		const dateNew = moment.utc(curdate).tz(process.env.TZ as string).format(format_type);
		return dateNew
	}

	changeDateTimeFormat(date: Date | string, from_format: string, to_format: string) {
		const dateNew = moment.utc(date, from_format).tz(process.env.TZ as string).format(to_format);
		return dateNew
	}

	async tokenDecrypt(encrypted: string) {
		let decryptOriginalToken = new jWT_helper();
		let token = await decryptOriginalToken.decryptMe(encrypted)
		return token as string;
	}

	randomNumberSixDig() {
		var ranNum = Math.floor(100000 + Math.random() * 900000);
		return ranNum;
	}

	validEmail(email: string) {
		const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([A-Za-zÃÁÂÀÄÇÉÈÊËÍÌÎÏÕÒÔÓÖÛÚÙÜãáàâäçéèêëíìîïñõôóòöûúùü\-0-9]+\.)+[A-Za-zÃÁÂÀÄÇÉÈÊËÍÌÎÏÕÒÔÓÖÛÚÙÜãáàâäçéèêëíìîïñõôóòöûúùü]{2,}))$/;
		return emailPattern.test(String(email).toLowerCase());
	}

	validPhoneNumber(phone: string) {
		const phonePattern = /^[0-9]{8,12}$/;
		return phonePattern.test(phone.replace(/\s+/g, ''));
	}

	sanitizeDecimal(num: string) {
		return num.includes('.') ? (parseInt(num.split('.')[1]) === 0 ? num.split('.')[0] : parseFloat(num).toFixed(2)) : num;
	}

	TokenExpiryDate(token_time: string) {
		let exp_time = token_time.substring(0, token_time.length - 1)
		var date = new Date();
		const dateNew = moment.utc(date).tz(process.env.TZ as string).add(exp_time, 'second').format('YYYY-MM-DD HH:mm:ss');
		return dateNew
	}

	makeSuccessServiceStatus = (msg: string, data: object) => {
		let make_status_obj = {
			status: true,
			status_code: global.helper_config.HTTP_RESPONSE_OK,
			data_sets: data,
			status_message: msg
		};
		return make_status_obj;
	}

	makeBadServiceStatus = (msg: string) => {
		let make_status_obj = {
			status: false,
			status_code: global.helper_config.HTTP_RESPONSE_BAD_REQUEST,
			status_message: msg
		};
		return make_status_obj;
	}

	public checkWhiteSpaceNullBlank(checkStr: string): boolean {
		if (checkStr === null) {
			return false;
		} else if (typeof checkStr === 'string') {
			if (checkStr.trim() == "") {
				return false;
			} else {
				return true;
			}
		} else {
			return true;
		}
	}

	public startsWith(value: string): string {
		return value.trim() + "%";
	}

	public contains(value: string): string {
		return "%" + value.trim() + "%";
	}

	public notContains(value: string): string {
		return "%" + value.trim() + "%";
	}

	public endsWith(value: string): string {
		return "%" + value.trim();
	}

	public equals(value: string): string {
		return value.trim();
	}

	public notEquals(value: string): string {
		return value.trim();
	}

	public globalFilter(value: string | number): string {
		if (typeof value === 'string') {
			return "%" + value.trim() + "%";
		}
		else {
			return "%" + value + "%";
		}

	}

	callSendMailMicroServices = async (Data: any, BASE_URL: any, route: string) => {
		try {
			let apiRoute = route;
			if (process.env.SEND_EMAIL == '1') {
				return await this.callMessageMicroServices(Data, BASE_URL, apiRoute, { 'content-type': 'application/json' });
			}
		} catch (error) {
			global.logs.writelog('callSendMailMicroServices', ["Error : ", error]);
		}
	}

	callMessageMicroServices = async (data_array: any, base_url: string, api_url: string, data_headers = { 'content-type': 'application/json' }) => {
		return new Promise(async (resolve, reject) => {
			try {
				const response = await axios.post(base_url + api_url, data_array, {
					headers: data_headers,
				});
				resolve(response.data);
			} catch (err) {
				reject(err);
			}
		});
	}

	callOtherMicroServices = async (data_array: any, base_url: string, api_url: string, data_headers = { 'content-type': 'application/json' }) => {
		return new Promise(async (resolve, reject) => {
			try {
				const response = await axios.post(base_url + api_url, data_array, {
					headers: data_headers,
				});
				resolve({
					error: false,
					data: response.data,
				});
			} catch (err: any) {
				reject({
					error: true,
					data: err.response.data
				});
			}
		});
	}

	public decryptAPIResponsedata = async (resBody: any) => {
		if (resBody.enc_data) {
			if (process.env.ENCRYPTED_DATA == '1') {
				resBody = JSON.parse(await global.encrypt_decrypt_helper.decryptRequest(resBody.enc_data)) || {};
			}
		}
		return resBody;
	}

	callGraphQLService = async (query: string, variables:  any = {}, data_headers = { 
		'Accept': 'application/json',
		'Authorization': `Basic ${process.env.API_AUTH_TOKEN}` 
	}) => {
		return new Promise(async (resolve, reject) => {
			try {
				const response = await axios.post(process.env.API_GRAPHQL_URL || "", { query, variables }, {
					headers: data_headers,
				});
				resolve({
					error: false,
					data: response.data,
				});
			} catch (err: any) {
				reject({
					error: true,
					data: err.response ? err.response.data : err.message,
				});
			}
		});
	};

	// Helper to Call GraphQL using graphql packages
	
   dateConvert(date: moment.MomentInput, format: string) {
		return moment(date).format(format)
   }
	

	/* sendEmailThroughSmtp = (data: mailData) => {
		this.initLog();
        const apiname_with_trace_id: string = "sendEmailThroughSmtp" + global.Helpers.getTraceID({data});
        global.logs.writelog(apiname_with_trace_id, ["REQUEST : ",{data}]);

		try {
			let senderemail = process.env.EMAIL_TYPE == 'SES' ? process.env.SES_USERNAME as string : process.env.NO_REPLY as string;
			let reciveremail = data.to
			let subject = data.subject
			let emaildata:any = data.emailbody
			let attachments = emaildata.attachments
			let that = this;
			// to use moment in ejs
			emaildata.moment = moment;
			emaildata.base_url = process.env.S3_BASE_URL + 'uploads/static';

			
			ejs.renderFile(global.path.resolve(__dirname, '../views/email_templates/'+emaildata.ejs_path), emaildata, async (err, data) => {
				if (err) {
					global.logs.writelog(apiname_with_trace_id, err, "ERROR");
				} else {
					let mailObj = {
						to: reciveremail,
						from: senderemail, 
						subject: subject, 
						reply_to: '', 
						attachments: attachments,
						emailbody: data
					};
					try{
						if(process.env.EMAIL_TYPE == 'SMTP'){
							let emailInfo =  await that._mailService.smtpSendSMTPEmail(mailObj)
							return emailInfo
						}
						else if(process.env.EMAIL_TYPE == 'SES'){
							let emailInfo = await that._mailService.smtpSendSESEmail(mailObj)
							return emailInfo
						}
					} catch(error: any) {
						global.logs.writelog(apiname_with_trace_id, error, "ERROR");
					}
				}
			});	
		} catch (error: any) {
			global.logs.writelog(apiname_with_trace_id, error, "ERROR");
		}
    } */

	/* checkClientIdForAuthCodeHelper = async(authCode: string) => {
		this.initLog();
        const apiname_with_trace_id: string = "checkClientIdForAuthCodeHelper" + global.Helpers.getTraceID({authCode});
        global.logs.writelog(apiname_with_trace_id, ["REQUEST : ",{authCode}]);
		try {
			const authCodeParams:any = JSON.parse(this.decryptObj(authCode));
			const authClientsModel = new AuthClientsModel();
			let checkClientIdExists = await authClientsModel.countAllByAny({
				where: {
					client_id: authCodeParams.client_id,
					client_name: authCodeParams.client_name
				}
			});
			global.logs.writelog(apiname_with_trace_id, ["checkClientIdExists : ", checkClientIdExists]);
			if(checkClientIdExists > 0){
				return true;
			} else {
				return false;
			}
		} catch (error: any) {
			global.logs.writelog(apiname_with_trace_id, error, "ERROR");
			return false;
		}
	} */
}