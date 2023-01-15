
import { getEventAdminRole, ROLE_EVENT_ORGANIZER } from "../../common/constants/roles.constants";
import { AuthService } from "../../auth/auth.service";
import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";
import { RoleService } from "../../common/utils/role.utils";
import { SWISS_PHONE_NUMBER_REGEX } from "../../common/constants/phone-regex.constants";

@Service()
export class AddUserByIdToEvent extends BaseCloudFunction<string> {

    constructor(private readonly authService: AuthService) {
        super();
    }

    async run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>) {
        if (!request.user) { throw 'unauthorized'; }
        if (!(await RoleService.isUserInRole(request.user, getEventAdminRole(request.params.eventId)))) {
            throw 'unauthorized';
        }

        const Event = Parse.Object.extend('Event');
        const query = new Parse.Query(Event);
        const event = await query.get(request.params.eventId, { useMasterKey: true });
        const user = await this.authService.getUserById(request.params.userId);

        if (!event || !event) {
            throw 'user or event unknown.';
        }

        const newUserEvent = new Parse.Object('UserEvent');
        newUserEvent.set('event', event);
        newUserEvent.set('user', user);
        newUserEvent.set('comment', 'Durch Organisator hinzugefügt.');
        const savedUserEvent = await newUserEvent.save(null, { useMasterKey: true });
        return savedUserEvent.id;
    }
}