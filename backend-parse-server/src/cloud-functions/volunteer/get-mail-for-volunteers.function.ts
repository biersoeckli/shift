import { Service } from "typedi";
import { AuthService } from "../../auth/auth.service";
import { PdfCreatorService } from "../../common/services/pdf-creator.service";
import { DateUtils } from "../../common/utils/date.utils";
import { RoleService } from "../../common/utils/role.utils";
import { TimeSpan, TimeSpanUtils } from "../../common/utils/time-span.utils";
import { EventService } from "../../event/event.service";
import { EventConfigUtils } from "../../event/utils/event-config.utils";
import { PayoutCalculationService } from "../../payout/payout-calculation.service";
import { VolunteerContractService } from "../../volunteer-contract/volunteer-contract.service";
import { AuthenticateWithPhoneNumberResult } from "../auth/auth-with-phonenumber.function";
import { BaseCloudFunction } from "../cloud-function.interface";

export interface VolunteerMailResult {
    userId: string;
    email: string;
}

@Service()
export class GetMailForAllVolunteersFunction extends BaseCloudFunction<VolunteerMailResult[]> {

    constructor(private readonly roleService: RoleService,
        private readonly eventService: EventService) {
        super();
    }

    async run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>) {
        if (!(await this.roleService.isUserOrganizerOfEvent(request.user as Parse.User, request.params.eventId))) {
            throw 'unauthorized';
        }
        const userEvents = await this.eventService.getUserEvents(request.params.eventId);
        return userEvents.map(userEvent => {
            return {
                userId: userEvent.get('user').id,
                email: userEvent.get('user').get('email')
            } as VolunteerMailResult;
        });
    }
}