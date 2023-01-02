import { SWISS_PHONE_NUMBER_REGEX } from "../common/constants/phone-regex.constants";
import { Service } from "typedi";
import { EnvUtils } from "../common/utils/env.utils";
import { StringUtils } from "../common/utils/string.utils";
import needle from 'needle';
/* eslint-disable */

@Service()
export class SmsService {

    async sendSms(phoneNumber: string, text: string) {
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
        return new Promise((resolve, reject) => {
            needle.post(EnvUtils.get().smsServiceUrl, body, (error, response) => {
                if (!error) {
                    resolve(response.body);
                    return;
                }
                reject(error);
            });
        })
    }
}
