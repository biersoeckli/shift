import { SWISS_PHONE_NUMBER_REGEX } from "../common/constants/phone-regex.constants";
import { Service } from "typedi";
import { EnvUtils } from "../common/utils/env.utils";
import { StringUtils } from "../common/utils/string.utils";
import needle from 'needle';
/* eslint-disable */

@Service()
export class SmsService {

    async sendSms(phoneNumber: string, text: string) {
        if (!EnvUtils.get().production) {
            console.warn('Cannot send sms in dev (production = false) mode.');
            console.warn('SMS Message: ' + text);
            return;
        }
        if (StringUtils.isEmpty(phoneNumber) || StringUtils.isEmpty(text)) {
            throw 'Error: Phone number or sms text not provided.';
        }

        if (phoneNumber.length === 10) {
            phoneNumber = `+41${phoneNumber.substring(1)}`;
        }

        if (!SWISS_PHONE_NUMBER_REGEX.test(phoneNumber)) {
            throw 'The phone field does not match the criteria for a swiss phone number: ' + phoneNumber;
        }

        const body = {
            "token": EnvUtils.get().smsServiceToken,
            "data": {
                "text": text,
                "recipient": phoneNumber
            }
        };

        await fetch(EnvUtils.get().smsServiceUrl, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        }).then(response => {
            if (response.ok) {
                console.log('SMS Service Response Status: ', response.statusText);
                return;
            }
            console.error('SMS Service Response Status: ', response.statusText);
            throw new Error('Error from SMS Service: ' + response.statusText);
        })

        /*
        return new Promise((resolve, reject) => {
            console.log('SMS Service URL ' + EnvUtils.get().smsServiceUrl);
            console.log('SMS Service Body: ' + JSON.stringify(body));
            needle.post(EnvUtils.get().smsServiceUrl, body, (error, response) => {
                console.log('SMS Service Response Statuscode: ' + response?.statusCode)
                if (!error) {
                    console.log('SMS Service Response: ' + response.body)
                    resolve(response.body);
                    return;
                }
                console.error(error);
                reject(error);
            });
        })*/
    }
}
