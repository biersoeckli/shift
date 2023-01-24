import { Service } from "typedi";
import { AuthService } from "../../auth/auth.service";
import { DateUtils } from "../../common/utils/date.utils";
import { RoleService } from "../../common/utils/role.utils";
import { TimeSpan, TimeSpanUtils } from "../../common/utils/time-span.utils";
import { PayoutCalculationService, UserPayoutInfo } from "../../payout/payout-calculation.service";
import { AuthenticateWithPhoneNumberResult } from "../auth/auth-with-phonenumber.function";
import { BaseCloudFunction } from "../cloud-function.interface";


@Service()
export class CalculateUserPayoutInfoFunction extends BaseCloudFunction<UserPayoutInfo> {

    constructor(private readonly payoutCalcService: PayoutCalculationService,
        private readonly roleService: RoleService) {
        super();
    }

    async run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>): Promise<UserPayoutInfo> {
        if ([request.params.userId, request.params.eventId].some(x => !x)) {
            throw 'not all params provided';
        }
        const isVolunteer = request.user?.id === request.params.userId &&
            await this.roleService.isUserVolunteerOfEvent(request.user, request.params.eventId);
        const isOrganizer = await this.roleService.isUserOrganizerOfEvent(request.user, request.params.eventId);
        if (!isVolunteer && !isOrganizer) {
            throw 'unauthorized';
        }
        return await this.payoutCalcService.getPayoutInfoForUser(request.params.userId, request.params.eventId);
    }
}