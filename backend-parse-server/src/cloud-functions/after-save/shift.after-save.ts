import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";
import { RoleService } from "../../common/utils/role.utils";
import { getEventAdminRole, getEventViewerRole } from "../../common/constants/roles.constants";

@Service()
export class ShiftAfterSave extends BaseCloudFunction<void> {

    constructor() {
        super();
    }

    async run(request: Parse.Cloud.AfterSaveRequest<Parse.Object<Parse.Attributes>>) {
        if (!request.original) {
            const eventAdminRole = await RoleService.getOrCreateRole(getEventAdminRole(request.object.get('event').id));
            const viewerRole = await RoleService.getOrCreateRole(getEventViewerRole(request.object.get('event').id));
            const acl = new Parse.ACL();
            acl.setPublicReadAccess(false);
            acl.setPublicWriteAccess(false);
            acl.setRoleReadAccess(eventAdminRole.get('name'), true);
            acl.setRoleWriteAccess(eventAdminRole.get('name'), true);
            acl.setRoleReadAccess(viewerRole.get('name'), true);
            acl.setRoleWriteAccess(viewerRole.get('name'), false);
            request.object.setACL(acl);
            await request.object.save(null, {useMasterKey: true});
        }
    }
}