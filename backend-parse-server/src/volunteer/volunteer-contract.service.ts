import { Service } from "typedi";
import { AuthService } from "../auth/auth.service";
import { EventService } from "../event/event.service";
import { PayoutCalculationService, UserPayoutInfo } from "../payout/payout-calculation.service";
import { marked } from 'marked';
import { StringUtils } from "../common/utils/string.utils";
import { PdfCreatorService } from "../common/services/pdf-creator.service";
import fs from 'fs/promises';
import path from 'path';
import { StaticPathConstants } from "../common/constants/static-paths.constants";
import { EnvUtils } from "../common/utils/env.utils";
import { SanitazionUtils } from "../common/utils/sanitazion.utils";

export interface GeneratedContractOutput {
    filePath: string;
    fileName: string;
    url: string;
}

const constractCss = `
<style>
body {
    font-family: Helvetica, sans-serif;
    font-size: 13px;
}

p, ul, li {
    font-size: 13px;
}

table {
    width: 100%;
}

th,
td {
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
    width: 33%;
    padding: 0;
}
</style>`

@Service()
export class VolunteerContractService {

    constructor(private readonly eventService: EventService,
        private readonly authService: AuthService,
        private readonly payoutCalculationService: PayoutCalculationService,
        private readonly pdfCreator: PdfCreatorService) { }

    async generateAndSaveContractToPublicFolder(eventId: string, userId: string) {
        const htmlContent = await this.generateContractHtml(eventId, userId);
        const buffer = await this.pdfCreator.generateFromHtml(htmlContent);
        const fileName = `contract-${eventId}-${userId}.pdf`;
        const filePath = path.join(StaticPathConstants.getVolunteerContractFilePath(), fileName);
        await fs.writeFile(filePath, buffer);
        return {
            fileName,
            filePath,
            url: `${EnvUtils.get().serverUrl.replace("/parse", "")}${StaticPathConstants.volunteerContractUrlPath}/${fileName}`
        } as GeneratedContractOutput;
    }

    async generateContractHtml(eventId: string, userId: string) {
        const event = await this.eventService.getEventById(eventId, true);
        const contractConfig = event.get('volunteerContractConfig') as Parse.Object<Parse.Attributes>;
        const user = await this.authService.getUserById(userId);
        if ([event, contractConfig, user].some(x => !x)) {
            throw 'Could not gather all required information to create contract.';
        }

        const userPayoutInfo = (await this.payoutCalculationService.getPayoutInfoForUser(userId, eventId)) ?? {} as UserPayoutInfo;
        const eventCategories = await this.getEventCategories(eventId);
        let htmlContractContent = constractCss;
        htmlContractContent += marked.parse(contractConfig.get('content'));
        htmlContractContent = this.replaceUserInfoPlaceholders(htmlContractContent, user);
        htmlContractContent = this.replacePayoutInfoPlaceholders(htmlContractContent, userPayoutInfo, eventCategories);
        htmlContractContent = this.replaceSignatureSectionPlaceholders(htmlContractContent, user);
        const userCategories = userPayoutInfo.shifts.map(shift => eventCategories.find(category => category.id === shift.shift.get('category').id)?.get('name') ?? '').join(', ');
        htmlContractContent = StringUtils.replaceAll(htmlContractContent, 'V_SHIFT_CATEGORIES', SanitazionUtils.sanitize(userCategories));
        return htmlContractContent;
    }

    replaceUserInfoPlaceholders(htmlInput: string, user: Parse.Object<Parse.Attributes>) {
        htmlInput = StringUtils.replaceAll(htmlInput, 'V_FIRSTNAME', SanitazionUtils.sanitize(user.get('firstName')));
        htmlInput = StringUtils.replaceAll(htmlInput, 'V_LASTNAME', SanitazionUtils.sanitize(user.get('lastName')));
        htmlInput = StringUtils.replaceAll(htmlInput, 'V_PHONE', SanitazionUtils.sanitize(user.get('phone')));
        htmlInput = StringUtils.replaceAll(htmlInput, 'V_MAIL', SanitazionUtils.sanitize(user.get('email')));
        return htmlInput;
    }

    replacePayoutInfoPlaceholders(htmlInput: string, userPayoutInfo: UserPayoutInfo, eventCategories: Parse.Object<Parse.Attributes>[]) {

        const shiftTableItems = userPayoutInfo.shifts.map(shift => `
            <tr>
                <td>
                    ${SanitazionUtils.sanitize(eventCategories.find(category => category.id === shift.shift.get('category')?.id)?.get('name'))}
                </td>
                <td>
                    ${SanitazionUtils.sanitize(StringUtils.fromTo(shift.shift.get('start'), shift.shift.get('end'), true))}
                </td>
                <td>CHF ${Math.floor(shift.shiftPayoutTotal)}.00</td>
            </tr>
        `).join('');

        htmlInput = StringUtils.replaceAll(htmlInput, 'PAYOUT_TABLE', `
            <table>
                <thead>
                    <tr>
                        <th>Kategorie</th>
                        <th>Schicht</th>
                        <th>Vergütung</th>
                    </tr>
                </thead>
                ${shiftTableItems}
            </table>
            <p>Total Vergütung: <b>CHF ${Math.floor(userPayoutInfo.payoutTotal)}.00</b></p>
        `);
        return htmlInput;
    }

    replaceSignatureSectionPlaceholders(htmlInput: string, user: Parse.Object<Parse.Attributes>) {
        htmlInput = StringUtils.replaceAll(htmlInput, 'SIGNATURE_SECTION', `
            <br>
            <br>
            <p style="width: 100%; border-top: 1px solid #e5e7eb; padding-top: 0.5rem;">Unterschrift ${SanitazionUtils.sanitize(user.get('firstName'))} ${SanitazionUtils.sanitize(user.get('lastName'))}</p>
        `);
        return htmlInput;
    }

    public async getEventCategories(eventId: string) {
        const query = new Parse.Query(Parse.Object.extend('EventCategory'));
        query.equalTo('event', await this.eventService.getEventById(eventId));
        query.limit(100000);
        return await query.find({ useMasterKey: true });
    }
}