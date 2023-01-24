import { Service } from "typedi";
import { AuthService } from "../auth/auth.service";
import { EventService } from "../event/event.service";
import { PayoutCalculationService, UserPayoutInfo } from "../payout/payout-calculation.service";
import { marked } from 'marked';
import { StringUtils } from "../common/utils/string.utils";

@Service()
export class VolunteerContractService {

    constructor(private readonly eventService: EventService,
        private readonly authService: AuthService,
        private readonly payoutCalculationService: PayoutCalculationService) { }

    async generateContractHtml(eventId: string, userId: string) {
        const event = await this.eventService.getEventById(eventId, true);
        const contractConfig = event.get('volunteerContractConfig') as Parse.Object<Parse.Attributes>;
        const user = await this.authService.getUserById(userId);
        if ([event, contractConfig, user].some(x => !x)) {
            throw 'Could not gather all required information to create contract.';
        }

        const userPayoutInfo = await this.payoutCalculationService.getPayoutInfoForUser(userId, eventId);
        let htmlContractContent = marked.parse(contractConfig.get('content'));
        htmlContractContent = this.replaceUserInfoPlaceholders(htmlContractContent, user);
        htmlContractContent = this.replacePayoutInfoPlaceholders(htmlContractContent, userPayoutInfo);
        htmlContractContent = this.replaceSignatureSectionPlaceholders(htmlContractContent, user);
        return htmlContractContent;
    }

    replaceUserInfoPlaceholders(htmlInput: string, user: Parse.Object<Parse.Attributes>) {
        htmlInput = htmlInput.replaceAll('V_FIRSTNAME', user.get('firstName'));
        htmlInput = htmlInput.replaceAll('V_LASTNAME', user.get('lastName'));
        htmlInput = htmlInput.replaceAll('V_PHONE', user.get('phone'));
        htmlInput = htmlInput.replaceAll('V_MAIL', user.get('email'));
        return htmlInput;
    }

    replacePayoutInfoPlaceholders(htmlInput: string, userPayoutInfo: UserPayoutInfo) {

        const shiftTableItems = userPayoutInfo.shifts.map(shift => `
            <tr>
                <td>
                    ${StringUtils.fromTo(shift.shift.get('start'), shift.shift.get('end'))}<br>CHF ${shift.shiftPayoutTotal}
                </td>
            </tr>
        `);

        htmlInput = htmlInput.replaceAll('PAYOUT_TABLE', `
            <table>
                ${shiftTableItems}
            </table>
            <p>Total: CHF ${userPayoutInfo.payoutTotal}</p>
        `);
        return htmlInput;
    }

    replaceSignatureSectionPlaceholders(htmlInput: string, user: Parse.Object<Parse.Attributes>) {
        htmlInput = htmlInput.replaceAll('SIGNATURE_SECTION', `
            <br>
            <br>
            <br>
            <br>
            <p>Unterschrift: ${user.get('firstName')} ${user.get('lastName')}</p>
        `);
        return htmlInput;
    }
}