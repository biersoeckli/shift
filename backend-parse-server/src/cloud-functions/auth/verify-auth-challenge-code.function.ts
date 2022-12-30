import { SWISS_PHONE_NUMBER_REGEX } from "../../common/constants/phone-regex.constants";
import { DateUtils } from "../../common/utils/date.utils";
import { AuthService } from "../../auth/auth.service";
import { DiContainer } from "../../di-container";

Parse.Cloud.define("verifyAuthChallengeCode", async (request) => {

    const { authCode, challengeId } = request.params;

    const ObjectQuery = Parse.Object.extend('MyTeam_AuthChallenge');
    const query = new Parse.Query(ObjectQuery);
    query.include('user');
    const challenge = await query.get(challengeId, { useMasterKey: true });
    if (!challenge) {
        throw 'Fehler: Bitte versuche es noch einmal';
    }
    const nowBefore5Min = DateUtils.addMinutes(new Date(), -5) as Date;
    if (DateUtils.gt(challenge.get('createdAt') as Date, nowBefore5Min)) {
        throw 'Der Anmeldevorgang hat zu lange gedauert und ist daher abgelaufen. Bitte starten Sie von vorn.';
    }

    const authService = DiContainer.get<AuthService>(AuthService);
    if (authService.hashMyTeamSmsCode(authCode) !== challenge.get('code')) {
        if (challenge.get('retries') > 3) {
            throw 'Sie haben den Code zu oft falsch eingegeben. Bitte starten Sie von vorn.';
        }
        challenge.increment('retries');
        await challenge.save(null, { useMasterKey: true });
        throw 'Ungültiger Authentifizierungscode';
    }
    let user = challenge.get('user');
    const { generatedUsername, generatedPassword } = authService.getRandomUserNameAndPassword(user.get('phone'));
    user.set('password', generatedPassword);
    user = await user.save(null, { useMasterKey: true });
    await challenge.destroy({ useMasterKey: true });
    return { username: user.get('username'), sessionKey: generatedPassword };
}, {
    fields: ['challengeId', 'authCode']
});

