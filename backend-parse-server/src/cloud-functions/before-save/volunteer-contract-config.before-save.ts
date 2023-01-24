import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";
import { RoleService } from "../../common/utils/role.utils";
import { getEventAdminRole, getEventViewerRole } from "../../common/constants/roles.constants";
import { DateUtils } from "../../common/utils/date.utils";
import { SanitazionUtils } from "../../common/utils/sanitazion.utils";

@Service()
export class VolunteerContractConfigBeforeSave extends BaseCloudFunction<void> {

    constructor() {
        super();
    }

    async run(request: Parse.Cloud.BeforeSaveRequest<Parse.Object<Parse.Attributes>>) {
        const eventAdminRole = await RoleService.getOrCreateRole(getEventAdminRole(request.object.get('event').id));
        const viewerRole = await RoleService.getOrCreateRole(getEventViewerRole(request.object.get('event').id));
        const acl = new Parse.ACL();
        acl.setPublicReadAccess(false);
        acl.setPublicWriteAccess(false);
        acl.setRoleReadAccess(eventAdminRole.get('name'), true);
        acl.setRoleWriteAccess(eventAdminRole.get('name'), true);
        acl.setRoleReadAccess(viewerRole.get('name'), false);
        acl.setRoleWriteAccess(viewerRole.get('name'), false);
        request.object.setACL(acl);
        request.object.set('content', SanitazionUtils.sanitize(request.object.get('content')));
    }
}