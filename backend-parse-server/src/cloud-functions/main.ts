
import { Container } from "typedi";
import { ROLE_EVENT_ORGANIZER } from "../common/constants/roles.constants";
import { AuthenticateWithPhoneNumberFunction } from "./auth/auth-with-phonenumber.function";
import { GetOrCreateUserForPhoneNumberFunction } from "./auth/createOrGetUserForPhoneNumber.function";
import { VerifyAuthChallengeCodeFunction } from "./auth/verify-auth-challenge-code.function";

Parse.Cloud.define("authenticateWithPhoneNumber", async (request) => {
    return await Container.get(AuthenticateWithPhoneNumberFunction).run(request);
}, {
    fields: ['phone']
});

Parse.Cloud.define("verifyAuthChallengeCode", async (request) => {
    return await Container.get(VerifyAuthChallengeCodeFunction).run(request);
}, {
    fields: ['challengeId', 'authCode']
});

Parse.Cloud.define("getOrCreateUserForPhoneNumber", async (request) => {
    return await Container.get(GetOrCreateUserForPhoneNumberFunction).run(request);
}, {
    fields: ['phone'],
    requireUser: true,
    requireAllUserRoles: [ROLE_EVENT_ORGANIZER]
});
