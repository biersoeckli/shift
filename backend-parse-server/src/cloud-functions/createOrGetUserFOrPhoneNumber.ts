import { ROLE_EVENT_ORGANIZER } from "../common/constants/roles.constants";
import { EnvUtils } from "../common/utils/env.utils";
import { UserUtils } from "../common/utils/user.utils";

Parse.Cloud.define("getOrCreateUserForPhoneNumber", async (request) => {
    if (!request.user || !await UserUtils.isUserInRole(request.user, 'myteam_trainer') && !request.master) {
        throw 'unauthorized';
    }
    if (!request.params.phone) {
        throw 'not all input fields provided';
    }

    // todo add firstname, lastname, mail fields

    const phone = request.params.phone;

    const User = Parse.Object.extend('_User');
    const innerQuery = new Parse.Query(User);
    innerQuery.equalTo('phone', phone);
    const results = await innerQuery.find({ useMasterKey: true });
    if (results.length === 0) {
        // user does not exists yet
        return await createNewUser(phone);
    } else if (results.length === 1) {
        return results[0].id;
    } else {
        throw 'too many users found for this phone number. '
    }
}, {
    fields: ['phone', 'firstName', 'lastName', 'mail']
});

/**
 * @returns id of created user
 */
async function createNewUser(phone: string): Promise<string> {
    const { generatedUsername, generatedPassword } = getRandomUserNameAndPassword(phone);

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

    const createdUser2 = await createdUser.save(null, { useMasterKey: true });
    return createdUser2.id;
}

function getRandomUserNameAndPassword(phone: string) {
    const crypto = require('crypto');
    const generatedUsername = crypto.createHash('sha256', EnvUtils.get().randomStringForHash)
        .update(phone)
        .digest('base64');
    const generatedPassword = crypto.createHash('sha256', EnvUtils.get().randomStringForHash)
        .update(generatedUsername + phone + new Date().toISOString())
        .digest('base64');
    return { generatedUsername, generatedPassword };
}