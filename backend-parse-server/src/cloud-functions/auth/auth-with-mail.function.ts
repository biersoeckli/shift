import { AuthService } from "../../auth/auth.service";
import { SmsService } from "../../sms/sms.service";
import { EnvUtils } from "../../common/utils/env.utils";
import { BaseCloudFunction } from "../cloud-function.interface";
import { Service } from "typedi";
import * as crypto from 'crypto';
import { MailService } from "../../mail/mail.service";

export interface AuthenticateWithMailResult {
    challengeId: string;
}

@Service()
export class AuthenticateWithMailFunction extends BaseCloudFunction<AuthenticateWithMailResult> {

    constructor(private readonly mailService: MailService,
        private readonly authService: AuthService) {
        super();
    }

    async run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>) {

        if (!request.params.email) {
            throw 'Die Email ist in einem ungültigen Format.';
        }

        const user = await this.authService.createOrGetUserForEmail(request.params.email);

        const code = EnvUtils.get().production ? crypto.randomInt(10000, 99999) : 11111;

        var GameScore = Parse.Object.extend("AuthChallenge");
        var gameScore = new GameScore();
        gameScore.set("user", user);
        gameScore.set('retries', 0);
        gameScore.set("code", this.authService.hashSmsCode(code + ''));
        const authChallenge = await gameScore.save(null, { useMasterKey: true });

        if (EnvUtils.get().production) {
            await this.mailService.sendMail(user.get('email'), 'Bestätigungscode für Shift.', `Dein Code für Shift lautet: ${code}`, false);
        } else {
            console.log('Code for authentication: ' + code);
        }
        return { challengeId: authChallenge.id } as AuthenticateWithMailResult;
    }
}
