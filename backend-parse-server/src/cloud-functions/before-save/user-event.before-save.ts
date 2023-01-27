import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";
import { RoleService } from "../../common/utils/role.utils";
import { getEventAdminRole, getEventViewerRole } from "../../common/constants/roles.constants";
import { EventService } from "../../event/event.service";
import { EventConfigUtils } from "../../event/utils/event-config.utils";

@Service()
export class UserEventBeforeSave extends BaseCloudFunction<void> {

    constructor(private readonly roleService: RoleService,
        private readonly eventService: EventService) {
        super();
    }

    async run(request: Parse.Cloud.BeforeSaveRequest<Parse.Object<Parse.Attributes>>) {
        const isMaster = request.master;
        const isOrganizer = await this.roleService.isUserOrganizerOfEvent(request.user, request.object.get('event').id);
        const isRelatedUser = request.user?.id === request.object.get('user').id;
        if (!isMaster && !isOrganizer && !isRelatedUser) {
            throw 'unauthorized';
        }

        const event = await this.eventService.getEventById(request.object.get('event').id);
        if (isRelatedUser && !isOrganizer && !EventConfigUtils.getFromEvent(event).volunteerRegistrationEnabled) {
            throw `Es können keine Anpassungen mehr für Registrierungen an dem Event "${event.get('name')}" vorgenommen werden.`;
        }

        const eventAdminRole = await RoleService.getOrCreateRole(getEventAdminRole(request.object.get('event').id));
        const acl = new Parse.ACL();
        acl.setPublicReadAccess(false);
        acl.setPublicWriteAccess(false);
        acl.setRoleReadAccess(eventAdminRole.get('name'), true);
        acl.setRoleWriteAccess(eventAdminRole.get('name'), true);
        acl.setReadAccess(request.object.get('user').id, true);
        acl.setWriteAccess(request.object.get('user').id, true);
        request.object.setACL(acl);
        if (!request.original) {
            await RoleService.addUser2Role(getEventViewerRole(request.object.get('event').id), request.object.get('user'));
        }
    }
}