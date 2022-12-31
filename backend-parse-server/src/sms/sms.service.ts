import { SWISS_PHONE_NUMBER_REGEX } from "../common/constants/phone-regex.constants";
import { Service } from "typedi";
/* eslint-disable */
//const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
@Service()
export class SmsService {
    
   async sendSms(phoneNumber: string, text: string) {
        if (!phoneNumber || !text) {
            throw 'Error: Phone number or sms text not provided.';
        }
    
        if (!SWISS_PHONE_NUMBER_REGEX.test(phoneNumber)) {
            throw 'The phone field does not match the criteria for a swiss phone number: ' + phoneNumber;
        }
    
        const body = {
            "token": process.env.SMS_SERVICE_TOKEN,
            "data": {
                "text": text,
                "recipient": phoneNumber
            }
        };
    /*
        const response = await fetch(`https://8702wg.biersoeckli.ch/sim-services/sms`, {
            method: 'POST',
            //mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'X-Parse-Application-Id': process.env.APP_ID || 'appId',
                'X-Parse-REST-API-Key': '',
                'X-Parse-Revocable-Session': 1 + '',
            },
            body: JSON.stringify(body)
        });
        const result = await response.json();*/
    }
}
