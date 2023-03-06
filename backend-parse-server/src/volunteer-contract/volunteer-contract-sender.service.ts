import { Service } from "typedi";
import { EventService } from "../event/event.service";
import { MailService } from "../mail/mail.service";
import { VolunteerContractService } from "./volunteer-contract.service";
import fs from 'fs/promises';

@Service()
export class VolunteerContractSenderService {

    constructor(private readonly eventService: EventService,
        private readonly volunteerContractService: VolunteerContractService,
        private readonly mailService: MailService) { }

    async sendContractToAllVolunteers(eventId: string) {
        const event = await this.eventService.getEventById(eventId);
        const userShifts = await this.eventService.getUserShifts(eventId);
        const usersWithShifts = userShifts.map(userShift => userShift.get('user') as Parse.User);
        for (const user of usersWithShifts) {
            const contractOutput = await this.volunteerContractService.generateAndSaveContractToPublicFolder(eventId, user.id);

            await this.mailService.sendMail(user.get('mail'),
                'Helfervertrag für ' + event.get('name'),
                ``, // html body todo
                true,
                event.get('name'),
                [{
                    filename: 'helfervertrag.pdf',
                    path: contractOutput.filePath,
                    contentType: 'application/pdf'
                }],
                event.get('contanctMail'), // todo
                event.get('contanctMail') // todo
            );
            await fs.rm(contractOutput.filePath); // remove after sending mail successfully
        }
    }
}