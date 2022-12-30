import { ROLE_EVENT_ORGANIZER } from "../common/constants/roles.constants";
import { EnvUtils } from "../common/utils/env.utils";

export class AuthService {

    async createOrGetUserForPhoneNumber(phone: string): Promise<Parse.Object<Parse.Attributes>> {
        if (!phone) {
            throw 'Phone number not provided.';
        }
        const User = Parse.Object.extend('_User');
        const innerQuery = new Parse.Query(User);
        innerQuery.equalTo('phone', phone);
        const results = await innerQuery.find({ useMasterKey: true });
        if (results.length === 0) {
            // user does not exists yet
            return await this.createNewUser(phone);
        } else if (results.length === 1) {
            return results[0];
        }
        console.error(`Too many users for phone number ${phone}.`);
        throw 'Error: Cannot authenticate user with this phone number. '
    }

    /**
     * @returns id of created user
     */
    async createNewUser(phone: string): Promise<Parse.Object<Parse.Attributes>> {
        const { generatedUsername, generatedPassword } = this.getRandomUserNameAndPassword(phone);

        const newUser = new Parse.Object('_User');
        newUser.set('username', 'phone_user_' + generatedUsername);
        newUser.set('password', generatedPassword);
        newUser.set('phone', phone);

        const createdUser = await newUser.save(null, { useMasterKey: true });

        const acl = new Parse.ACL();
        acl.setWriteAccess(createdUser.id, true);
        acl.setReadAccess(createdUser.id, true);
        acl.setPublicReadAccess(false);
        acl.setPublicWriteAccess(false);
        acl.setRoleReadAccess(ROLE_EVENT_ORGANIZER, true);
        acl.setRoleWriteAccess(ROLE_EVENT_ORGANIZER, false);
        createdUser.setACL(acl);

        return await createdUser.save(null, { useMasterKey: true });
    }

    getRandomUserNameAndPassword(phone: string) {
        const crypto = require('crypto');
        const generatedUsername = crypto.createHash('sha256', EnvUtils.get().randomStringForHash)
            .update(phone)
            .digest('base64');
        const generatedPassword = crypto.createHash('sha256', EnvUtils.get().randomStringForHash)
            .update(generatedUsername + phone + new Date().toISOString())
            .digest('base64');
        return { generatedUsername, generatedPassword };
    }

    hashMyTeamSmsCode(code: string) {
        const crypto = require('crypto');
        return crypto.createHash('sha256', 'sasdfuh2o8ewzqghbvlsdazhfgvozdmlAaa8sOFj5FEeiQlYD66jHEJRS1NLLsqMCeN9pqibot*9sdtgh4sdfg1h99g*sg/0GC0dO3hfpiwuiu@sadfu29/o8z*ljdhbf')
            .update('' + code)
            .digest('base64');
    }
}