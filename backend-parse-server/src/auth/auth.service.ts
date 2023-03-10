import { Service } from "typedi";
import { ROLE_EVENT_ORGANIZER } from "../common/constants/roles.constants";
import { EnvUtils } from "../common/utils/env.utils";

@Service()
export class AuthService {

    async createOrGetUserForPhoneNumber(phone: string): Promise<Parse.Object<Parse.Attributes>> {
        if (!phone) {
            throw 'Phone number not provided.';
        }
        const user = await this.getUserByPhone(phone);
        return user ?? await this.createNewUser(phone)
    }

    async getUserByPhone(phone: string) {
        const User = Parse.Object.extend('_User');
        const query = new Parse.Query(User);
        query.equalTo('phone', phone);
        const results = await query.find({ useMasterKey: true });
        if (results.length > 1) {
            console.error(`Too many users for phone number ${phone}.`);
            throw 'Error: Cannot handle user with this phone number. ';
        }
        return results.length === 0 ? undefined : results[0];
    }

    async getUserById(userId: string) {
        const User = Parse.Object.extend('_User');
        const query = new Parse.Query(User);
        return await query.get(userId, { useMasterKey: true });
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

    hashSmsCode(code: string) {
        const crypto = require('crypto');
        return crypto.createHash('sha256', EnvUtils.get().randomStringForHash)
            .update('' + code)
            .digest('base64');
    }
}