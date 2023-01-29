import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";
import { RoleService } from "../../common/utils/role.utils";
import { getEventAdminRole, getEventViewerRole } from "../../common/constants/roles.constants";
import { EventConfigUtils } from "../../event/utils/event-config.utils";
import { EventService } from "../../event/event.service";

@Service()
export class EventDocumentBeforeSave extends BaseCloudFunction<void> {

    constructor(private eventService: EventService) {
        super();
    }

    async run(request: Parse.Cloud.BeforeSaveRequest<Parse.Object<Parse.Attributes>>) {
        const event = await this.eventService.getEventById(request.object.get('event').id);
        if (!EventConfigUtils.getFromEvent(event).documentUploadEnabled) {
            throw `Upload von Dokumenten ist für den Event ${event.get('name')} deaktiviert.`;
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
    }
}