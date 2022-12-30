import { SWISS_PHONE_NUMBER_REGEX } from "../../common/constants/phone-regex.constants";
import { AuthService } from "../../auth/auth.service";
import { SmsService } from "../../sms/sms.service";
import { EnvUtils } from "../../common/utils/env.utils";
import { BaseCloudFunction } from "../cloud-function.interface";
import { Service } from "typedi";
import * as crypto from 'crypto';

@Service()
export class AuthenticateWithPhoneNumberFunction extends BaseCloudFunction {

    constructor(private readonly smsService: SmsService,
        private readonly authService: AuthService) {
        super();
    }

    init() {
        Parse.Cloud.define("authenticateWithPhoneNumber", async (request) => {

            if (!SWISS_PHONE_NUMBER_REGEX.test(request.params.phone)) {
                throw 'Die Telefonnummer ist ungültig.';
            }

            const user = await this.authService.createOrGetUserForPhoneNumber(request.params.phone);

            const code = crypto.randomInt(10000, 99999);

            var GameScore = Parse.Object.extend("AuthChallenge");
            var gameScore = new GameScore();
            gameScore.set("user", user);
            gameScore.set('retries', 0);
            gameScore.set("code", this.authService.hashSmsCode(code + ''));
            const authChallenge = await gameScore.save(null, { useMasterKey: true });

            await this.smsService.sendSms(user.get('phone'), `Dein Code für Shift lautet: ${code}`);

            if (!EnvUtils.get().production) {
                console.log('Code for authentication: ' + code);
            }
            return { challengeId: authChallenge.id };
        }, {
            fields: ['phone']
        });
    }
}
