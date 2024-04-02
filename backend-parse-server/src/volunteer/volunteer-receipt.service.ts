import { Service } from "typedi";
import { AuthService } from "../auth/auth.service";
import { EventService } from "../event/event.service";
import { PayoutCalculationService, UserPayoutInfo } from "../payout/payout-calculation.service";
import { marked } from 'marked';
import { StringUtils } from "../common/utils/string.utils";
import { PdfCreatorService } from "../common/services/pdf-creator.service";
import fs, { readFile } from 'fs/promises';
import path from 'path';
import { StaticPathConstants } from "../common/constants/static-paths.constants";
import { EnvUtils } from "../common/utils/env.utils";
import { SanitazionUtils } from "../common/utils/sanitazion.utils";

export interface GeneratedContractOutput {
    filePath: string;
    fileName: string;
    url: string;
}

@Service()
export class VolunteerReceiptService {

    constructor(private readonly eventService: EventService,
        private readonly authService: AuthService,
        private readonly payoutCalculationService: PayoutCalculationService,
        private readonly pdfCreator: PdfCreatorService) { }

    async generateAndSaveReceiptToPublicFolder(eventId: string, userId: string, overridePayoutAmount?: number) {
        const htmlContent = await this.generateContractHtml(eventId, userId, overridePayoutAmount);
        const buffer = await this.pdfCreator.generateFromHtml(htmlContent);
        const fileName = `receipt-${eventId}-${userId}.pdf`;
        const filePath = path.join(StaticPathConstants.getVolunteerContractFilePath(), fileName);
        await fs.writeFile(filePath, buffer);
        return {
            fileName,
            filePath,
            url: `${EnvUtils.get().serverUrl.replace("/parse", "")}${StaticPathConstants.volunteerContractUrlPath}/${fileName}`
        } as GeneratedContractOutput;
    }

    async generateContractHtml(eventId: string, userId: string, overridePayoutAmount?: number) {
        const event = await this.eventService.getEventById(eventId, true);
        const user = await this.authService.getUserById(userId);
        if ([event, user].some(x => !x)) {
            throw 'Could not gather all required information to create receipt.';
        }

        const userPayoutInfo = (await this.payoutCalculationService.getPayoutInfoForUser(userId, eventId)) ?? {} as UserPayoutInfo;
        const eventCategories = await this.getEventCategories(eventId);

        let htmlContractContent = await readFile(StaticPathConstants.getReceiptTemplateFilePath(), 'utf-8');
        htmlContractContent = this.replaceUserInfoPlaceholders(htmlContractContent, user, userPayoutInfo, eventCategories, overridePayoutAmount);
        return htmlContractContent;
    }

    replaceUserInfoPlaceholders(htmlInput: string, user: Parse.Object<Parse.Attributes>, 
        userPayoutInfo: UserPayoutInfo, eventCategories: Parse.Object<Parse.Attributes>[], overridePayoutAmount?: number) {

        const shiftNames = userPayoutInfo.shifts?.map(shift => eventCategories.find(category => category.id === shift.shift.get('category')?.id)?.get('name') ?? '')
            .filter(x => !!x)
            .join(', ') ?? 'no_shifts';

        htmlInput = htmlInput.replaceAll('V_FIRSTNAME', SanitazionUtils.sanitize(user.get('firstName')));
        htmlInput = htmlInput.replaceAll('V_LASTNAME', SanitazionUtils.sanitize(user.get('lastName')));
        htmlInput = htmlInput.replaceAll('V_PHONE', SanitazionUtils.sanitize(user.get('phone')));
        htmlInput = htmlInput.replaceAll('V_MAIL', SanitazionUtils.sanitize(user.get('email')));
        htmlInput = htmlInput.replaceAll('CURRENT_DATE', new Date().toLocaleDateString('de-CH'));
        htmlInput = htmlInput.replaceAll('SHIFT_CATEGORY_NAMES', SanitazionUtils.sanitize(shiftNames));
        htmlInput = htmlInput.replaceAll('PAYOUT_TOTAL', SanitazionUtils.sanitize(`CHF ${overridePayoutAmount ?? Math.floor(userPayoutInfo.payoutTotal)}.00`));
        return htmlInput;
    }

    public async getEventCategories(eventId: string) {
        const query = new Parse.Query(Parse.Object.extend('EventCategory'));
        query.equalTo('event', await this.eventService.getEventById(eventId));
        query.limit(100000);
        return await query.find({ useMasterKey: true });
    }
}