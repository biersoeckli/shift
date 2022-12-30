
import { ROLE_EVENT_ORGANIZER } from "../../common/constants/roles.constants";
import { UserUtils } from "../../common/utils/user.utils";
import { AuthService } from "../../auth/auth.service";
import { DiContainer } from "../../di-container";

Parse.Cloud.define("getOrCreateUserForPhoneNumber", async (request) => {
    if (!request.user || !await UserUtils.isUserInRole(request.user, ROLE_EVENT_ORGANIZER) && !request.master) {
        throw 'unauthorized';
    }
    const phone = request.params.phone;
    const user = await DiContainer.get<AuthService>(AuthService).createOrGetUserForPhoneNumber(phone);
    return user.id;
}, {
    fields: ['phone']
});

