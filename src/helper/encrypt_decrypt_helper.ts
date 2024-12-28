import {IConfigforEncryptDecrypt} from "./common_interface";
import * as CryptoJS from 'crypto-js';

export class Encryption {

    private algorithm: string;
    private key: CryptoJS.lib.WordArray;
    private salt: string;
    private iv: CryptoJS.lib.WordArray;

    constructor(config: IConfigforEncryptDecrypt) {
        this.algorithm = config.algorithm || '';
        this.salt = config.salt || '';
        this.key = CryptoJS.enc.Utf8.parse(config.encryptionKey);
        this.iv = CryptoJS.enc.Utf8.parse(config.iv);
        // validate missing config options
        if (!this.algorithm && !this.key) {
            throw Error('Configuration Error!');
        }
    }

    /**
	 * @developer : Prithwiraj Bhadra
	 * @date : 03-04-2024
	 * @description : helper to generate encrypted response to whole application
     * @Params : {text: string}
  	*/
    encryptResponse (text: string) {
        if(!text) return ''
        const encryptUsingAES256 = CryptoJS.AES.encrypt(text, this.key, {
            keySize: 16,
            iv: this.iv,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });
        const response = encryptUsingAES256.toString();
        return response;
    }

    /**
	 * @developer : Prithwiraj Bhadra
	 * @date : 03-04-2024
	 * @description : helper to generate encrypted response to whole application
     * @Params : {text: string}
  	*/
    decryptRequest = async (text: any) => {
        return CryptoJS.AES.decrypt(text, this.key, {
            keySize: 16,
            iv: this.iv,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        }).toString(CryptoJS.enc.Utf8);
    }

}