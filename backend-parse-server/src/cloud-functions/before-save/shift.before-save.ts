import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";
import { RoleService } from "../../common/utils/role.utils";
import { getEventAdminRole, getEventViewerRole } from "../../common/constants/roles.constants";
import { DateUtils } from "../../common/utils/date.utils";

@Service()
export class ShiftBeforeSave extends BaseCloudFunction<void> {

    constructor() {
        super();
    }

    async run(request: Parse.Cloud.BeforeSaveRequest<Parse.Object<Parse.Attributes>>) {
        if (!DateUtils.gt(request.object.get('start'), request.object.get('end'))) {
            throw 'Das Startdatum muss vor dem Enddatum liegen.';
        }
    
        const query = new Parse.Query(Parse.Object.extend('Event'));
        const event = await query.get(request.object.get('event').id, { useMasterKey: true });
    
        if (DateUtils.gt(request.object.get('start'), event.get('start'))) {
            throw 'Das Startdatum muss innerhalb der Dauer des Events liegen.';
        }
    
        if (DateUtils.gt(event.get('end'), request.object.get('end'))) {
            throw 'Das Enddatum muss innerhalb der Dauer des Events liegen.';
        }
        
        const eventAdminRole = await RoleService.getOrCreateRole(getEventAdminRole(request.object.get('event').id));
        const viewerRole = await RoleService.getOrCreateRole(getEventViewerRole(request.object.get('event').id));
        const acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        acl.setPublicWriteAccess(false);
        acl.setRoleReadAccess(eventAdminRole.get('name'), true);
        acl.setRoleWriteAccess(eventAdminRole.get('name'), true);
        acl.setRoleReadAccess(viewerRole.get('name'), true);
        acl.setRoleWriteAccess(viewerRole.get('name'), false);
        request.object.setACL(acl);
    }
}