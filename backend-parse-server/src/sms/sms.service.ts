import { SWISS_PHONE_NUMBER_REGEX } from "../common/constants/phone-regex.constants";
import { Service } from "typedi";
import { EnvUtils } from "../common/utils/env.utils";
import { fetchWrapper } from "../common/utils/fetchwrapper.utils";
import { StringUtils } from "../common/utils/string.utils";
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
        const fetch = require('make-fetch-happen');
        const response = await fetch(EnvUtils.get().smsServiceUrl, {
            method: 'POST',
            //mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        return await response.json();
    }
}
