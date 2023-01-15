
import { Container } from "typedi";
import { ROLE_EVENT_ORGANIZER } from "../common/constants/roles.constants";
import { DateUtils } from "../common/utils/date.utils";
import { StringUtils } from "../common/utils/string.utils";
import { AddUserByIdToEvent } from "./auth/add-user-to-event";
import { AuthenticateWithPhoneNumberFunction } from "./auth/auth-with-phonenumber.function";
import { GetOrCreateUserForPhoneNumberFunction } from "./auth/createOrGetUserForPhoneNumber.function";
import { VerifyAuthChallengeCodeFunction } from "./auth/verify-auth-challenge-code.function";
import { EventCategoryAfterSave } from "./after-save/event-category.after-save";
import { EventAfterSave } from "./after-save/event.after-save";
import { ShiftAfterSave } from "./after-save/shift.after-save";
import { UserEventAfterSave } from "./after-save/user-event.after-save";
import { UserShiftWishAfterSave } from "./after-save/user-shift-wish.after-save";
import { UserShiftAfterSave } from "./after-save/userShift.after-save";
import { UserEventCategoryAfterSave } from "./after-save/user-event-category.after-save";

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

Parse.Cloud.define("addUserByIdToEvent", async (request) => {
    return await Container.get(AddUserByIdToEvent).run(request);
}, {
    fields: ['userId', 'eventId'],
    requireUser: true,
    requireAllUserRoles: [ROLE_EVENT_ORGANIZER]
});

Parse.Cloud.beforeSave("Event", async (request) => {
    if (!DateUtils.gt(request.object.get('start'), request.object.get('end'))) {
        throw 'Das Startdatum muss vor dem Enddatum liegen';
    }
    if (request.object.get('start')) {
        (request.object.get('start') as Date).setSeconds(0);
        (request.object.get('start') as Date).setMilliseconds(0);
    }
    if (request.object.get('end')) {
        (request.object.get('end') as Date).setSeconds(0);
        (request.object.get('end') as Date).setMilliseconds(0);
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

Parse.Cloud.beforeSave("Shift", async request => {
    if (!DateUtils.gt(request.object.get('start'), request.object.get('end'))) {
        throw 'Das Startdatum muss vor dem Enddatum liegen.';
    }

    const query = new Parse.Query(Parse.Object.extend('Event'));
    const event =  await query.get(request.object.get('event').id, {useMasterKey: true});
   
    if (DateUtils.gt(request.object.get('start'), event.get('start'))) {
        throw 'Das Startdatum muss innerhalb der Dauer des Events liegen.';
    }

    if (DateUtils.gt(event.get('end'), request.object.get('end'))) {
        throw 'Das Enddatum muss innerhalb der Dauer des Events liegen.';
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
});

Parse.Cloud.afterSave("Shift", async (request) => {
    return await Container.get(ShiftAfterSave).run(request);
});

Parse.Cloud.beforeSave("UserShift", () => { }, {
    fields: {
        user: {
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


Parse.Cloud.beforeSave("UserShiftWish", () => { }, {
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

Parse.Cloud.afterSave("UserShiftWish", async (request) => {
    return await Container.get(UserShiftWishAfterSave).run(request);
});

Parse.Cloud.beforeSave("UserEvent", () => { }, {
    fields: {
        user: {
            required: true
        },
        event: {
            required: true
        }
    },
    requireUser: true
});

Parse.Cloud.afterSave("UserEvent", async (request) => {
    return await Container.get(UserEventAfterSave).run(request);
});


Parse.Cloud.beforeSave("EventCategory", async request => {
    
}, {
    fields: {
        event: {
            required: true
        },
        name: {
            required: true
        }
    },
    requireAllUserRoles: [ROLE_EVENT_ORGANIZER],
    requireUser: true
});

Parse.Cloud.afterSave("EventCategory", async (request) => {
    return await Container.get(EventCategoryAfterSave).run(request);
});

Parse.Cloud.beforeSave("UserEventCategory", async request => {
    
}, {
    fields: ['event', 'user', 'category'],
    requireUser: true
});

Parse.Cloud.afterSave("UserEventCategory", async (request) => {
    return await Container.get(UserEventCategoryAfterSave).run(request);
});
