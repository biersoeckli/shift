import { DateUtils } from "../../common/utils/date.utils";
import { AuthService } from "../../auth/auth.service";
import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";

@Service()
export class VerifyAuthChallengeCodeFunction extends BaseCloudFunction {

    constructor(private readonly authService: AuthService) {
        super();
    }

    init() {
        Parse.Cloud.define("verifyAuthChallengeCode", async (request) => {
        
            const { authCode, challengeId } = request.params;
        
            const ObjectQuery = Parse.Object.extend('AuthChallenge');
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
        
            if (this.authService.hashSmsCode(authCode) !== challenge.get('code')) {
                if (challenge.get('retries') >= 3) {
                    throw 'Sie haben den Code zu oft falsch eingegeben. Bitte starten Sie von vorn.';
                }
                challenge.increment('retries');
                await challenge.save(null, { useMasterKey: true });
                throw 'Ungültiger Authentifizierungscode';
            }
            let user = challenge.get('user');
            const { generatedUsername, generatedPassword } = this.authService.getRandomUserNameAndPassword(user.get('phone'));
            user.set('password', generatedPassword);
            user = await user.save(null, { useMasterKey: true });
            await challenge.destroy({ useMasterKey: true });
            return { username: user.get('username'), sessionKey: generatedPassword };
        }, {
            fields: ['challengeId', 'authCode']
        });  
    }
}
