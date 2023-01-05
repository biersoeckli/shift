import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";
import { RoleUtils } from "../../common/utils/role.utils";
import { getEventAdminRole, getEventViewerRole } from "../../common/constants/roles.constants";

@Service()
export class UserShiftWishAfterSave extends BaseCloudFunction<void> {

    constructor() {
        super();
    }

    async run(request: Parse.Cloud.AfterSaveRequest<Parse.Object<Parse.Attributes>>) {
        if (!request.original) {
            const eventAdminRole = await RoleUtils.getOrCreateRole(getEventAdminRole(request.object.get('event').id));
            const acl = new Parse.ACL();
            acl.setPublicReadAccess(false);
            acl.setPublicWriteAccess(false);
            acl.setRoleReadAccess(eventAdminRole.get('name'), true);
            acl.setRoleWriteAccess(eventAdminRole.get('name'), false);
            acl.setReadAccess(request.object.get('user').id, true);
            acl.setWriteAccess(request.object.get('user').id, true);
            request.object.setACL(acl);
            await request.object.save(null, {useMasterKey: true});
        }
    }
}