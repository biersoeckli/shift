import { Service } from "typedi";
import { BaseCloudFunction } from "../cloud-function.interface";
import { RoleService } from "../../common/utils/role.utils";
import { getEventAdminRole, getEventViewerRole } from "../../common/constants/roles.constants";
import { MailService } from "../../mail/mail.service";
import { SmsService } from "../../sms/sms.service";
import { EventService } from "../../event/event.service";
import { AuthService } from "../../auth/auth.service";

@Service()
export class UserEventAfterSave extends BaseCloudFunction<void> {

    constructor(private readonly mailService: MailService,
        private readonly smsService: SmsService,
        private readonly eventService: EventService,
        private readonly authService: AuthService) {
        super();
    }

    async run(request: Parse.Cloud.AfterSaveRequest<Parse.Object<Parse.Attributes>>) {
        if (!request.original && !request.object.get('createdByOrganizer')) {
            const event = await this.eventService.getEventById(request.object.get('event').id);
            const user = await this.authService.getUserById(request.object.get('user').id);

           const text = `Du hast dich erfolgreich für den Event "${event.get('name')}" registriert. Vielen Dank!` +
           `Du kannst dir deine Registrierung jederzeit unter https://shift.biersoeckli.ch ansehen. ` +
           `Später werden dort auch weitere Informationen zu deinem Helfereinsatz ersichtlich sein. ` +
           `Bei Fragen wende dich bitte an ${event.get('contactMail')}. Wir melden uns in den nächsten Wochen nochmals bei dir.`;
                

           this.smsService.sendSms(user.get('phone'), text);
           this.mailService.sendMail(user.get('email'), 'Registrierung erfolgreich',
             `Hallo ${user.get('firstName')}<br><br>${text}<br><br>Freundliche Grüsse<br>Das Team vom ${event.get('name')}`, true, event.get('name'));
        }
    }
}