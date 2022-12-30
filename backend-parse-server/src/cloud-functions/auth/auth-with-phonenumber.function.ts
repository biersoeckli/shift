import { SWISS_PHONE_NUMBER_REGEX } from "../../common/constants/phone-regex.constants";
import { AuthService } from "../../auth/auth.service";
import { DiContainer } from "../../di-container";
import { SmsService } from "../../sms/sms.service";
import { EnvUtils } from "../../common/utils/env.utils";

Parse.Cloud.define("authenticateWithPhoneNumber", async (request) => {

    if (!SWISS_PHONE_NUMBER_REGEX.test(request.params.phone)) {
        throw 'Die Telefonnummer ist ungültig.';
    }

    const authService = DiContainer.get<AuthService>(AuthService);
    const user = await authService.createOrGetUserForPhoneNumber(request.params.phone);

    const crypto = require('crypto');
    const code = crypto.randomInt(10000, 99999);

    var GameScore = Parse.Object.extend("MyTeam_AuthChallenge");
    var gameScore = new GameScore();
    gameScore.set("user", user);
    gameScore.set('retries', 0);
    gameScore.set("code", authService.hashMyTeamSmsCode(code));
    const authChallenge = await gameScore.save(null, { useMasterKey: true });

    await DiContainer.get<SmsService>(SmsService).sendSms(user.get('phone'), `Dein Code für MyTeam lautet: ${code}`);

    if (!EnvUtils.get().production) {
        console.log('Code for authentication: ' + code);
    }
    return { challengeId: authChallenge.id };
}, {
    fields: ['phone']
});
