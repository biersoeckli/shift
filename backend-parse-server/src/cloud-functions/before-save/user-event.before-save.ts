import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";
import { RoleService } from "../../common/utils/role.utils";
import { getEventAdminRole, getEventViewerRole } from "../../common/constants/roles.constants";

@Service()
export class UserEventBeforeSave extends BaseCloudFunction<void> {

    constructor(private readonly roleService: RoleService) {
        super();
    }

    async run(request: Parse.Cloud.BeforeSaveRequest<Parse.Object<Parse.Attributes>>) {
        if (request.master) {
            return;
        }
        if (await this.roleService.isUserOrganizerOfEvent(request.user, request.object.get('event').id)) {
            return;
        }
        if (request.user?.id === request.object.get('user').id) {
            return;
        }
        throw 'unauthorized';
    }
}