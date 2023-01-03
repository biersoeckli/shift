
import { Container } from "typedi";
import { ROLE_EVENT_ORGANIZER } from "../common/constants/roles.constants";
import { DateUtils } from "../common/utils/date.utils";
import { StringUtils } from "../common/utils/string.utils";
import { AuthenticateWithPhoneNumberFunction } from "./auth/auth-with-phonenumber.function";
import { GetOrCreateUserForPhoneNumberFunction } from "./auth/createOrGetUserForPhoneNumber.function";
import { VerifyAuthChallengeCodeFunction } from "./auth/verify-auth-challenge-code.function";
import { EventAfterSave } from "./event/event.after-save";
import { ShiftAfterSave } from "./event/shift.after-save";
import { UserShiftAfterSave } from "./event/userShift.after-save";

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

Parse.Cloud.beforeSave("Event", async (request) => {
    if (!DateUtils.gt(request.object.get('start'), request.object.get('end'))) {
        throw 'Das Startdatum muss vor dem Enddatum liegen';
    }
}, {
    fields: {
        name: {
            options: (name: string) => StringUtils.isNotEmpty(name),
            error: 'Das Feld "Name" ist ein Plichtfeld.'
        },
        start: {
            required: true,
            error: 'Das Startdatum ist ein Pflichtfeld.'
        },
        end: {
            required: true,
            error: 'Das Enddatum ist ein Pflichtfeld.'
        }
    },
    requireAllUserRoles: [ROLE_EVENT_ORGANIZER],
    requireUser: true
});

Parse.Cloud.afterSave("Event", async (request) => {
    return await Container.get(EventAfterSave).run(request);
});
// todo enable again
/*
Parse.Cloud.beforeSave("Shift", request => {
    if (!DateUtils.gt(request.object.get('start'), request.object.get('end'))) {
        throw 'Das Startdatum muss vor dem Enddatum liegen';
    }
}, {
    fields: {
        start: {
            required: true,
            error: 'Das Startdatum ist ein Pflichtfeld.'
        },
        end: {
            required: true,
            error: 'Das Enddatum ist ein Pflichtfeld.'
        },
        event: {
            required: true
        }
    },
    requireAllUserRoles: [ROLE_EVENT_ORGANIZER],
    requireUser: true
});*/

Parse.Cloud.afterSave("Shift", async (request) => {
    return await Container.get(ShiftAfterSave).run(request);
});

Parse.Cloud.beforeSave("UserShift", () => { }, {
    fields: {
        user: {
            required: true
        },
        shift: {
            required: true
        },
        event: {
            required: true
        }
    },
    requireAllUserRoles: [ROLE_EVENT_ORGANIZER],
    requireUser: true
});

Parse.Cloud.afterSave("UserShift", async (request) => {
    return await Container.get(UserShiftAfterSave).run(request);
});
