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

export interface UserForEvent {
    eventId: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    comment: string;
    commentIternal: string;
    createdByOrganizer: boolean;
    acl: unknown;
    password: unknown;
    sessionKey: unknown;
}

@Service()
export class GetUsersForEventFunction extends BaseCloudFunction<UserForEvent[]> {

    constructor(private readonly payoutCalcService: PayoutCalculationService,
        private readonly roleService: RoleService,
        private readonly eventService: EventService) {
        super();
    }

    async run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>): Promise<UserForEvent[]> {
        const isOrganizer = await this.roleService.isUserOrganizerOfEvent(request.user, request.params.eventId);
        if (!isOrganizer) {
            throw 'unauthorized';
        }
        const userEvents = await this.eventService.getUserEvents(request.params.eventId);
        return userEvents.map(userEvent => {
            const returnVal = {
                ...userEvent.get('user').attributes,
                userId: userEvent.get('user').id,
                createdByOrganizer: userEvent.get('createdByOrganizer') ?? false,
                comment: userEvent.get('comment'),
                commentInternal: userEvent.get('commentInternal')
            } as UserForEvent;
            returnVal.acl = undefined;
            returnVal.password = undefined;
            returnVal.sessionKey = undefined;
            return returnVal;
        });
    }
}