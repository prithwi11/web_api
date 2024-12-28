import * as jwt from "jsonwebtoken";
import crypto, {CipherKey, CipherMode } from 'crypto';


export class jWT_helper {

	constructor(){
    }

	/**
	 * @developer : Prithwiraj Bhadra
	 * @date : 26-07-2023
	 * @description : Token creation
  	*/

	public createToken = async (tokenDetails:object) => {

		var that = this;
		
		return new Promise(async function (resolve, reject) {
			
			const algorithm: any = process.env.JWT_ALGORITHM;

			/*Access token generation*/
			var accessTokenCreate = jwt.sign(tokenDetails, process.env.JWT_SECRET as string, {
				algorithm: algorithm,
				expiresIn: process.env.JWT_EXPIRES as string | undefined
			});
			let expiresIn:any =  process.env.JWT_EXPIRES;

			var current_unix_timestamp = Math.floor(+new Date() / 1000);
            var acces_token_expired = current_unix_timestamp+parseInt(expiresIn.replace("s",""));
			var accessToken: unknown = await that.encryptMe(accessTokenCreate) as string;
			/*End*/
			
			/*Refresh token generation*/
			var refreshTokenCreate = jwt.sign(tokenDetails, process.env.REFRESH_TOKEN_KEY as string, { 
				algorithm: algorithm,
				expiresIn: process.env.REFRESH_TOKEN_EXPIRE
			});
			
			let expiresat:any =  process.env.REFRESH_TOKEN_EXPIRE;

            var refresh_token_expired = current_unix_timestamp+parseInt(expiresat.replace("s",""));

			var refreshToken: unknown = await that.encryptMe(refreshTokenCreate) as string;
			/*End*/


			const response = {
				error: false,
				message: 'Token created successfully.',
				accessToken: accessToken,
				acces_token_expired : acces_token_expired,
				refreshToken: refreshToken,
				refresh_token_expired: refresh_token_expired
			};

			return resolve(response);
		});
		
	}

	/**
	 * @developer : Prithwiraj Bhadra
	 * @date : 26-07-2023
	 * @description : Token verification
  	*/
    verifyToken = async (token:string) => {

        /*Decrypt the token*/
        var tokenDecrypted:any = await this.decryptMe(token);
        var that = this;        
		return new Promise(function (resolve, reject) {
			const algorithm: any = process.env.JWT_ALGORITHM;
			
			jwt.verify(tokenDecrypted, process.env.JWT_SECRET as string, algorithm,async (err:any, data:any) => {
				if (err) {
					return reject({error:true, message:'Unable to verified token.', errorstack:err});
				} else {
					return resolve({error:false, message:'Token verified successfully.',verifiedData:data});
				}
			});	
		
		});
    }

	/**
	 * @developer : Prithwiraj Bhadra
	 * @date : 26-07-2023
	 * @description : Token encryption
  	*/
	encryptMe = async (val:string) => {
        var that = this;
        return new Promise(function (resolve, reject) {
            (async () => {
                try{
					const secretKey: CipherKey = process.env.JWT_SECRET as CipherKey;
					const ivKey:CipherMode = process.env.ENCRYPTION_IV_KEY as CipherMode;
                    let cipher = crypto.createCipheriv(process.env.CRYPT_ALGO as string, secretKey, ivKey);
                    let encrypted = cipher.update(val, 'utf8', 'base64');
                    encrypted += cipher.final('base64');
                    return resolve(encrypted);
                } catch(e) {
                    return reject(e)
                }
            })();
        });
    }

	/**
	 * @developer : Prithwiraj Bhadra
	 * @date : 26-07-2023
	 * @description : Token decryption
  	*/
	decryptMe = async (encrypted:string) => {
        var that = this;
        return new Promise(function (resolve, reject) {
            (async () => {
                try{
					const secretKey: CipherKey = process.env.JWT_SECRET as CipherKey;
					const ivKey:CipherMode = process.env.ENCRYPTION_IV_KEY as CipherMode;
                    let decipher = crypto.createDecipheriv(process.env.CRYPT_ALGO as string, secretKey, ivKey);
                    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
                    return resolve(decrypted + decipher.final('utf8'));
                } catch(e) {
                    return reject(e)
                }
            })();
        });
    }

	/**
	 * @developer : Prithwiraj Bhadra
	 * @date : 26-07-2023
	 * @description : Regenarate token
  	*/
    regenerateToken = async (param:any) => {
        var that = this;
		return new Promise(function (resolve, reject) {
            (async () => {
                try{
                    var refreshTokenOldDecrypted:any = await that.decryptMe(param.param.refreshTokenOld);
                    var accessTokenOldDecrypted:any = await that.decryptMe(param.param.accessTokenOld);
                    /*If unable to RSA decrypt*/
                    if(!refreshTokenOldDecrypted || !accessTokenOldDecrypted) {
                        return resolve(false);
                    }
                    /*End*/

                    var generateTokenFlag = false;
					const algorithm: any = process.env.JWT_ALGORITHM;
					/*Verify access token*/
                    jwt.verify(accessTokenOldDecrypted, process.env.JWT_SECRET as string,algorithm, function (err:any, result) {
                        if (result) {
                            generateTokenFlag = true;
                        } else {
                            if(err.name == 'TokenExpiredError') { /*Token is valid but expired*/
                                generateTokenFlag = true;
                            } else {
                                return resolve(false);
                            }
                        }
						/*End*/	
						
						/*Verify refresh token*/
						jwt.verify(refreshTokenOldDecrypted, process.env.REFRESH_TOKEN_KEY as string, algorithm, function (err, result:any) {
							(async () => {
								if (result) {
									generateTokenFlag = true;
								} else {
									return resolve(false);
								}
								try{
									if(generateTokenFlag) {
										var tokenResult = await that.createToken({param : result.param});
										return resolve(tokenResult)
										/*End*/
									}
								} catch(e) {
									return reject(e)
								}
							})();
							});
							/*End*/
					});
                } catch(e) {
                    return reject(e)
                }
            })();
		});
    }
}