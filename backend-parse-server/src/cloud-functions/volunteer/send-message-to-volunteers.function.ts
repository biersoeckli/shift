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
import { SmsService } from "../../sms/sms.service";
import { MailService } from "../../mail/mail.service";

@Service()
export class SendMessageToVolunteersFunction extends BaseCloudFunction<void> {

    constructor(private readonly roleService: RoleService,
        private readonly eventService: EventService,
        private readonly smsService: SmsService,
        private readonly mailService: MailService) {
        super();
    }

    async run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>) {
        if (!(await this.roleService.isUserOrganizerOfEvent(request.user as Parse.User, request.params.eventId))) {
            throw 'unauthorized';
        }
        const event = await this.eventService.getEventById(request.params.eventId);
        const userEvents = await this.eventService.getUserEvents(request.params.eventId);
        const selectedUsers = userEvents.filter(userEvent => request.params.userIds.includes(userEvent.get('user').id));
        const message = request.params.message;

        for (let userEvent of selectedUsers) {
            await this.mailService.sendMail(
                userEvent.get('user').get('email'),
                `Nachricht für Event "${event.get('name')}"`,
                message, true,
                event.get('name'));
            console.log(`Successfully sent mail to ${userEvent.get('user').get('firstName')} ${userEvent.get('user').get('lastName')} ${userEvent.get('user').get('email')}`);
        }
        for (let userEvent of selectedUsers) {
            await this.smsService.sendSms(userEvent.get('user').get('phone'), message);
            console.log(`Successfully sent sms to ${userEvent.get('user').get('firstName')} ${userEvent.get('user').get('lastName')} ${userEvent.get('user').get('phone')}`);
        }
    }
}