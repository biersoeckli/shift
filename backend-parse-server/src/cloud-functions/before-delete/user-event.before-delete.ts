import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";
import { RoleService } from "../../common/utils/role.utils";
import { getEventAdminRole, getEventViewerRole } from "../../common/constants/roles.constants";
import { MailService } from "../../mail/mail.service";
import { SmsService } from "../../sms/sms.service";
import { EventService } from "../../event/event.service";
import { AuthService } from "../../auth/auth.service";

@Service()
export class UserEventBeforeDelete extends BaseCloudFunction<void> {

    constructor(private readonly authService: AuthService,
        private readonly roleService: RoleService) {
        super();
    }

    async run(request: Parse.Cloud.BeforeDeleteRequest<Parse.Object<Parse.Attributes>>) {
        const isOrganizer = await this.roleService.isUserOrganizerOfEvent(request.user, request.object.get('event').id);
        if (!isOrganizer) {
            throw 'unauthorized';
        }
        const user = await this.authService.getUserById(request.object.get('user').id);
        await this.deleteUserData('UserShift', 'user', user);
        await this.deleteUserData('UserEventCategory', 'user', user);
        await this.deleteUserData('UserShiftWish', 'user', user);
        await this.deleteUserData('EventDocument', 'user', user);
    }

    async deleteUserData(entityName: string, userFieldName: string, userObject: Parse.Object<Parse.Attributes>) {
        const User = Parse.Object.extend(entityName);
        const query = new Parse.Query(User);
        query.equalTo(userFieldName, userObject);
        query.limit(100000);
        const results = await query.find({ useMasterKey: true });
        await Parse.Object.destroyAll(results, { useMasterKey: true });
    }
}