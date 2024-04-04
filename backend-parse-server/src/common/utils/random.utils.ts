import { EnvUtils } from "./env.utils";

export class RandomUtils {

    static randomMasterKey: string;

    static getRandomString() {
        const crypto = require('crypto');
        const generatedPassword = crypto.createHash('sha256', EnvUtils.get().randomStringForHash || crypto.randomBytes(20).toString('hex'))
            .update(new Date().toISOString() + crypto.randomBytes(20).toString('hex'))
            .digest('base64');
        return generatedPassword;
    }
}