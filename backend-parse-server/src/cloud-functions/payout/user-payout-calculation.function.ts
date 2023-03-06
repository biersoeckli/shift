import { Service } from "typedi";
import { AuthService } from "../../auth/auth.service";
import { DateUtils } from "../../common/utils/date.utils";
import { RoleService } from "../../common/utils/role.utils";
import { TimeSpan, TimeSpanUtils } from "../../common/utils/time-span.utils";
import { EventService } from "../../event/event.service";
import { EventConfigUtils } from "../../event/utils/event-config.utils";
import { PayoutCalculationService, UserPayoutInfo } from "../../payout/payout-calculation.service";
import { AuthenticateWithPhoneNumberResult } from "../auth/auth-with-phonenumber.function";
import { BaseCloudFunction } from "../cloud-function.interface";


@Service()
export class CalculateUserPayoutInfoFunction extends BaseCloudFunction<UserPayoutInfo | undefined> {

    constructor(private readonly payoutCalcService: PayoutCalculationService,
        private readonly roleService: RoleService,
        private readonly eventService: EventService) {
        super();
    }

    async run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>): Promise<UserPayoutInfo | undefined> {
        const isVolunteer = request.user?.id === request.params.userId &&
            await this.roleService.isUserVolunteerOfEvent(request.user, request.params.eventId);
        const isOrganizer = await this.roleService.isUserOrganizerOfEvent(request.user, request.params.eventId);
        if (!isVolunteer && !isOrganizer) {
            throw 'unauthorized';
        }
        const event = await this.eventService.getEventById(request.params.eventId);
        if (!EventConfigUtils.getFromEvent(event).volunteerPayoutEnabled) {
            throw `Das berechnen von Auszahlungsinformationen ist für den Event ${event.get('name')} deaktiviert.`;
        }

        return await this.payoutCalcService.getPayoutInfoForUser(request.params.userId, request.params.eventId);
    }
}