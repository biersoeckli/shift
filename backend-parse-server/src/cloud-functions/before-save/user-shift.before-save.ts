import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";
import { RoleService } from "../../common/utils/role.utils";
import { getEventAdminRole, getEventViewerRole } from "../../common/constants/roles.constants";

@Service()
export class UserShiftBeforeSave extends BaseCloudFunction<void> {

    constructor() {
        super();
    }

    async run(request: Parse.Cloud.BeforeSaveRequest<Parse.Object<Parse.Attributes>>) {
        const eventAdminRole = await RoleService.getOrCreateRole(getEventAdminRole(request.object.get('event').id));
        const acl = new Parse.ACL();
        acl.setPublicReadAccess(false);
        acl.setPublicWriteAccess(false);
        acl.setRoleReadAccess(eventAdminRole.get('name'), true);
        acl.setRoleWriteAccess(eventAdminRole.get('name'), true);
        acl.setReadAccess(request.object.get('user').id, true);
        acl.setWriteAccess(request.object.get('user').id, false);
        request.object.setACL(acl);
    }
}