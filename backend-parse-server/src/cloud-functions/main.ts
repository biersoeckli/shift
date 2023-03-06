
import { Container } from "typedi";
import { ROLE_EVENT_ORGANIZER } from "../common/constants/roles.constants";
import { DateUtils } from "../common/utils/date.utils";
import { StringUtils } from "../common/utils/string.utils";
import { AddUserByIdToEvent } from "./auth/add-user-to-event";
import { AuthenticateWithPhoneNumberFunction } from "./auth/auth-with-phonenumber.function";
import { GetOrCreateUserForPhoneNumberFunction } from "./auth/createOrGetUserForPhoneNumber.function";
import { VerifyAuthChallengeCodeFunction } from "./auth/verify-auth-challenge-code.function";
import { EventAfterSave } from "./after-save/event.after-save";
import { UserEventCategoryBeforeSave } from "./before-save/user-event-category.before-save";
import { UserEventBeforeSave } from "./before-save/user-event.before-save";
import { UserShiftWishBeforeSave } from "./before-save/user-shift-wish.before-save";
import { UserShiftBeforeSave } from "./before-save/user-shift.before-save";
import { ShiftBeforeSave } from "./before-save/shift.before-save";
import { EventCategoryBeforeSave } from "./before-save/event-category.before-save";
import { EventDocumentBeforeSave } from "./before-save/event-document.before-save";
import { CalculateUserPayoutInfoFunction } from "./payout/payout-calculation.function";
import { PayoutConfigBeforeSave } from "./before-save/payout-config.before-save";
import { VolunteerContractConfigBeforeSave } from "./before-save/volunteer-contract-config.before-save";
import { GenerateVolunteerContractFunction } from "./volunteer-contract/generate-volunteer-contract.function";
import { UserEventAfterSave } from "./after-save/user-event.after-save";
import { UserEventBeforeDelete } from "./before-delete/user-event.before-delete";
import { GetUsersForEventFunction } from "./user-event/get-users-for-event.function";
import { CalculateTotalEventPayoutInfoFunction } from "./payout/event-payout-calculation.function";

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

Parse.Cloud.define("calculateUserPayoutInfoForEvent", async (request) => {
    return await Container.get(CalculateUserPayoutInfoFunction).run(request);
}, {
    fields: ['userId', 'eventId'],
    requireUser: true
});

Parse.Cloud.define("calculateTotalEventPayoutInfo", async (request) => {
    return await Container.get(CalculateTotalEventPayoutInfoFunction).run(request);
}, {
    fields: ['eventId'],
    requireUser: true,
    requireAllUserRoles: [ROLE_EVENT_ORGANIZER]
});

Parse.Cloud.define("generateVolunteerContract", async (request) => {
    return await Container.get(GenerateVolunteerContractFunction).run(request);
}, {
    fields: ['userId', 'eventId'],
    requireUser: true
});

Parse.Cloud.define("getUsersForEvent", async (request) => {
    return await Container.get(GetUsersForEventFunction).run(request);
}, {
    fields: ['eventId']
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
        },
        contactMail: {
            required: true,
            error: 'Der Kontakt ist ein Pflichtfeld.'
        }
    },
    requireAllUserRoles: [ROLE_EVENT_ORGANIZER],
    requireUser: true
});

Parse.Cloud.afterSave("Event", async (request) => {
    return await Container.get(EventAfterSave).run(request);
});

Parse.Cloud.beforeSave("Shift", async request => {
    await Container.get(ShiftBeforeSave).run(request);
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

Parse.Cloud.beforeSave("PayoutConfig", async request => {
    await Container.get(PayoutConfigBeforeSave).run(request);
}, {
    fields: {
        start: {
            required: true
        },
        end: {
            required: true
        },
        event: {
            required: true
        }
    },
    requireAllUserRoles: [ROLE_EVENT_ORGANIZER],
    requireUser: true
});

Parse.Cloud.beforeSave("VolunteerContractConfig", async request => {
    await Container.get(VolunteerContractConfigBeforeSave).run(request);
}, {
    fields: {
        content: {
            required: true
        },
        event: {
            required: true
        }
    },
    requireAllUserRoles: [ROLE_EVENT_ORGANIZER],
    requireUser: true
});

Parse.Cloud.beforeSave("UserShift", async (request) => {
    return await Container.get(UserShiftBeforeSave).run(request);
}, {
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

Parse.Cloud.beforeSave("UserShiftWish", async request => {
    await Container.get(UserShiftWishBeforeSave).run(request);
}, {
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
    requireUser: true
});

Parse.Cloud.beforeSave("UserEvent", async request => {
    await Container.get(UserEventBeforeSave).run(request);
}, {
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

Parse.Cloud.afterSave("UserEvent", async request => {
    await Container.get(UserEventAfterSave).run(request);
});

Parse.Cloud.beforeDelete("UserEvent", async request => {
    await Container.get(UserEventBeforeDelete).run(request);
});

Parse.Cloud.beforeSave("EventCategory", async request => {
    await Container.get(EventCategoryBeforeSave).run(request);
}, {
    fields: ['event', 'name'],
    requireAllUserRoles: [ROLE_EVENT_ORGANIZER],
    requireUser: true
});


Parse.Cloud.beforeSave("UserEventCategory", async request => {
    await Container.get(UserEventCategoryBeforeSave).run(request);
}, {
    fields: ['event', 'user', 'category'],
    requireUser: true
});


Parse.Cloud.beforeSave("EventDocument", async request => {
    await Container.get(EventDocumentBeforeSave).run(request);
}, {
    fields: ['name', 'type', 'file', 'user', 'event'],
    requireUser: true
});
