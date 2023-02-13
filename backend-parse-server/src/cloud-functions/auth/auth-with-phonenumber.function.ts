import { SWISS_PHONE_NUMBER_REGEX } from "../../common/constants/phone-regex.constants";
import { AuthService } from "../../auth/auth.service";
import { SmsService } from "../../sms/sms.service";
import { EnvUtils } from "../../common/utils/env.utils";
import { BaseCloudFunction } from "../cloud-function.interface";
import { Service } from "typedi";
import * as crypto from 'crypto';

export interface AuthenticateWithPhoneNumberResult {
    challengeId: string;
}

@Service()
export class AuthenticateWithPhoneNumberFunction extends BaseCloudFunction<AuthenticateWithPhoneNumberResult> {

    constructor(private readonly smsService: SmsService,
        private readonly authService: AuthService) {
        super();
    }

    async run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>) {

        if (!SWISS_PHONE_NUMBER_REGEX.test(request.params.phone) || request.params.phone.length !== 10) {
            throw 'Die Telefonnummer ist in einem ungültigen Format. Hinweis: Schweizer Telefonnummer in folgendem Format: 0791234567';
        }

        const user = await this.authService.createOrGetUserForPhoneNumber(request.params.phone);

        const code = EnvUtils.get().production ? crypto.randomInt(10000, 99999) : 11111;

        var GameScore = Parse.Object.extend("AuthChallenge");
        var gameScore = new GameScore();
        gameScore.set("user", user);
        gameScore.set('retries', 0);
        gameScore.set("code", this.authService.hashSmsCode(code + ''));
        const authChallenge = await gameScore.save(null, { useMasterKey: true });

        if (EnvUtils.get().production) {
            await this.smsService.sendSms(user.get('phone'), `Dein Code für Shift lautet: ${code}`);
        } else {
            console.log('Code for authentication: ' + code);
        }
        return { challengeId: authChallenge.id } as AuthenticateWithPhoneNumberResult;
    }
}
