import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";
import { RoleService } from "../../common/utils/role.utils";
import { getEventAdminRole, getEventViewerRole } from "../../common/constants/roles.constants";

@Service()
export class EventAfterSave extends BaseCloudFunction<void> {

    constructor() {
        super();
    }

    async run(request: Parse.Cloud.AfterSaveRequest<Parse.Object<Parse.Attributes>>) {
        if (!request.original) {
            const adminRole = await RoleService.getOrCreateRole(getEventAdminRole(request.object.id));
            const viewerRole = await RoleService.getOrCreateRole(getEventViewerRole(request.object.id));
            await RoleService.addUser2Role(adminRole.get('name'), request.user as any);
            const acl = new Parse.ACL();
            acl.setPublicReadAccess(false);
            acl.setPublicWriteAccess(false);
            acl.setRoleReadAccess(adminRole.get('name'), true);
            acl.setRoleWriteAccess(adminRole.get('name'), true);
            acl.setRoleReadAccess(viewerRole.get('name'), true);
            acl.setRoleWriteAccess(viewerRole.get('name'), false);
            request.object.setACL(acl);
            await request.object.save(null, {useMasterKey: true});
        }
    }
}