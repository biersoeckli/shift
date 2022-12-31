
import { ROLE_EVENT_ORGANIZER } from "../../common/constants/roles.constants";
import { UserUtils } from "../../common/utils/user.utils";
import { AuthService } from "../../auth/auth.service";
import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";

@Service()
export class GetOrCreateUserForPhoneNumberFunction extends BaseCloudFunction<string> {

    constructor(private readonly authService: AuthService) {
        super();
    }

    async run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>) {
        if (!request.user || !await UserUtils.isUserInRole(request.user, ROLE_EVENT_ORGANIZER) && !request.master) {
            throw 'unauthorized';
        }
        const phone = request.params.phone;
        const user = await this.authService.createOrGetUserForPhoneNumber(phone);
        return user.id;
    }
}