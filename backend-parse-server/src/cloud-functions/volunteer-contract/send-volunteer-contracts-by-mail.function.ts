import { Service } from "typedi";
import { AuthService } from "../../auth/auth.service";
import { PdfCreatorService } from "../../common/services/pdf-creator.service";
import { DateUtils } from "../../common/utils/date.utils";
import { RoleService } from "../../common/utils/role.utils";
import { TimeSpan, TimeSpanUtils } from "../../common/utils/time-span.utils";
import { EventService } from "../../event/event.service";
import { EventConfigUtils } from "../../event/utils/event-config.utils";
import { PayoutCalculationService } from "../../payout/payout-calculation.service";
import { VolunteerContractSenderService } from "../../volunteer/volunteer-contract-sender.service";
import { VolunteerContractService } from "../../volunteer/volunteer-contract.service";
import { AuthenticateWithPhoneNumberResult } from "../auth/auth-with-phonenumber.function";
import { BaseCloudFunction } from "../cloud-function.interface";

@Service()
export class SendVolunteerContractsByMail extends BaseCloudFunction<void> {

    constructor(private readonly volunteerContractSender: VolunteerContractSenderService,
        private readonly roleService: RoleService) {
        super();
    }

    async run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>) {
        if (!(await this.roleService.isUserOrganizerOfEvent(request.user as Parse.User, request.params.eventId))) {
            throw 'unauthorized';
        }
        await this.volunteerContractSender.sendContractToAllVolunteers(request.params.eventId, request.params.userIds, request.user?.id ?? '');
    }
}