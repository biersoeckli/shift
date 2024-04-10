import { Service } from "typedi";
import { EventService } from "../event/event.service";
import { MailService } from "../mail/mail.service";
import { VolunteerContractService } from "./volunteer-contract.service";
import fs from 'fs/promises';
import { AuthService } from "../auth/auth.service";
import { EnvUtils } from "../common/utils/env.utils";
import Mail from "nodemailer/lib/mailer";
import { SanitazionUtils } from "../common/utils/sanitazion.utils";
import { marked } from 'marked';
import { StringUtils } from "../common/utils/string.utils";

@Service()
export class VolunteerContractSenderService {

    constructor(private readonly eventService: EventService,
        private readonly authService: AuthService,
        private readonly volunteerContractService: VolunteerContractService,
        private readonly mailService: MailService) { }

    async sendContractToAllVolunteers(eventId: string, userIds: string[], organizerUserid: string) {
        const organizerUser = await this.authService.getUserById(organizerUserid);

        const event = await this.eventService.getEventById(eventId, true);
        const contractConfig = event.get('volunteerContractConfig') as Parse.Object<Parse.Attributes>;

        const userShifts = await this.eventService.getUserShifts(eventId);
        const usersWithShifts = userShifts
            .filter(userShift => userIds.includes(userShift.get('user').id))
            .map(userShift => userShift.get('user') as Parse.User);
        const userWithoutDuplicates = this.removeDuplicates(usersWithShifts);

        for (const user of userWithoutDuplicates) {
            const contractOutput = await this.volunteerContractService.generateAndSaveContractToPublicFolder(eventId, user.id);

            const mailContent = this.getMailContentAndReplacePlaceholders(contractConfig, user);

            let mailOptions: Mail.Options = {
                from: `"${event.get('name')}" <${EnvUtils.get().mailUser}>`,
                to: user.get('email'),
                bcc: organizerUser.get('email'),
                replyTo: organizerUser.get('email'),
                subject: 'Helfervertrag für ' + event.get('name'),
                html: mailContent,
                attachments: [
                    {
                        filename: 'helfervertrag.pdf',
                        path: contractOutput.filePath,
                        contentType: 'application/pdf'
                    }
                ]
            };
            await this.mailService.sendMailWithOptions(mailOptions);
            await fs.rm(contractOutput.filePath); // remove after sending mail successfully
        }
    }

    removeDuplicates<T>(list: T[]) {
        let uniqueList = [];
        let ids = new Set();
        for (const obj of list) {
            if (!ids.has((obj as any).id)) {
                uniqueList.push(obj);
                ids.add((obj as any).id);
            }
        }
        return uniqueList;
    }

    getMailContentAndReplacePlaceholders(contractConfig: Parse.Object<Parse.Attributes>, user: Parse.User<Parse.Attributes>) {
        let mailContent = marked.parse(contractConfig.get('mailTemplate'));
        mailContent = StringUtils.replaceAll(mailContent, 'V_FIRSTNAME', SanitazionUtils.sanitize(user.get('firstName')));
        mailContent = StringUtils.replaceAll(mailContent, 'V_LASTNAME', SanitazionUtils.sanitize(user.get('lastName')));
        mailContent = StringUtils.replaceAll(mailContent, 'V_PHONE', SanitazionUtils.sanitize(user.get('phone')));
        mailContent = StringUtils.replaceAll(mailContent, 'V_MAIL', SanitazionUtils.sanitize(user.get('email')));
        return mailContent;
    }
}