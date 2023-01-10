
import { ROLE_EVENT_ORGANIZER } from "../../common/constants/roles.constants";
import { AuthService } from "../../auth/auth.service";
import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";
import { RoleUtils } from "../../common/utils/role.utils";
import { SWISS_PHONE_NUMBER_REGEX } from "../../common/constants/phone-regex.constants";

@Service()
export class GetOrCreateUserForPhoneNumberFunction extends BaseCloudFunction<string> {

    constructor(private readonly authService: AuthService) {
        super();
    }

    async run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>) {
        if (!SWISS_PHONE_NUMBER_REGEX.test(request.params.phone)) {
            throw 'Die Telefonnummer ist ungültig.';
        }
        const phone = request.params.phone;
        let user = await this.authService.getUserByPhone(phone);
        if (user) {
            return user.id;
        }
        if ([request.params.firstName, request.params.lastName, request.params.email].some(x => !x)) {
            throw 'Folgende Felder sind Plichtfelder: Vorname, Nachname, Email';
        }
        user = await this.authService.createNewUser(phone);
        user.set('firstName', request.params.firstName);
        user.set('lastName', request.params.lastName);
        user.set('email', request.params.email);
        user = await user.save(null, { useMasterKey: true });
        return user.id;
    }
}