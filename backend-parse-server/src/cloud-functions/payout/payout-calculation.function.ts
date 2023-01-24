import { Service } from "typedi";
import { AuthService } from "../../auth/auth.service";
import { DateUtils } from "../../common/utils/date.utils";
import { RoleService } from "../../common/utils/role.utils";
import { TimeSpan, TimeSpanUtils } from "../../common/utils/time-span.utils";
import { AuthenticateWithPhoneNumberResult } from "../auth/auth-with-phonenumber.function";
import { BaseCloudFunction } from "../cloud-function.interface";

export interface UserPayoutInfo {
    shifts: ShiftPayoutInfo[],
    payoutTotal: number
}

interface ShiftPayoutInfo {
    shift: Parse.Object<Parse.Attributes>,
    payoutHourItems: PayoutHourItem[],
    shiftPayoutTotal: number,
}

interface PayoutHourItem {
    timeSpan: TimeSpan,
    rate: number
}
@Service()
export class CalculateUserPayoutInfoFunction extends BaseCloudFunction<UserPayoutInfo> {

    constructor(private readonly authService: AuthService,
        private readonly roleService: RoleService) {
        super();
    }

    async run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>): Promise<UserPayoutInfo> {
        if ([request.params.userId, request.params.eventId].some(x => !x)) {
            throw 'not all params provided';
        }
        const isVolunteer = request.user?.id === request.params.userId &&
            await this.roleService.isUserVolunteerOfEvent(request.user, request.params.eventId);
        const isOrganizer = await this.roleService.isUserOrganizerOfEvent(request.user, request.params.eventId);
        if (!isVolunteer && !isOrganizer) {
            throw 'unauthorized';
        }
        return await this.getPayoutInfoForUser(request.params.userId, request.params.eventId);
    }

    public async getUserShiftsForEventAndUser(userId: string, eventId: string) {
        const query = new Parse.Query(Parse.Object.extend('UserShift'));
        query.equalTo('event', await this.getEventById(eventId));
        query.equalTo('user', await this.authService.getUserById(userId));
        query.include('event');
        query.include('user');
        query.include('shift');
        query.limit(100000);
        return await query.find({ useMasterKey: true });
    }

    async getPayoutInfoForUser(userId: string, eventId: string) {
        const shifts = await this.getPayoutItems(userId, eventId)
        const payoutTotal = shifts.reduce(
            (prevTotal, shift) => prevTotal + shift.shiftPayoutTotal, 0)
        return {
            shifts,
            payoutTotal
        } as UserPayoutInfo;
    }

    async getPayoutItems(userId: string, eventId: string) {
        const payoutConfigs = await this.getPayoutConfigsForEvent(eventId);
        const shifts = await this.getUserShiftsForEventAndUser(userId, eventId);
        const shiftsWithRates = shifts.map(shift => {
            const payoutHourItems = this.getPayoutItemsForShift(shift, payoutConfigs);
            return {
                shift,
                payoutHourItems,
                shiftPayoutTotal: payoutHourItems.reduce(
                    (prevTotal, payoutHourItem) => prevTotal + payoutHourItem.rate, 0)
            } as ShiftPayoutInfo;
        });
        return shiftsWithRates;
    }

    getPayoutItemsForShift(shift: Parse.Object<Parse.Attributes>, payoutConfigs: Parse.Object<Parse.Attributes>[]) {

        const shiftMinutesLength = TimeSpanUtils.getMinutesBetweenDates(shift.get('start'), shift.get('end'));
        const shiftHours = Math.ceil(shiftMinutesLength / 60); // rounded up always

        const payoutHourItems: PayoutHourItem[] = [];

        let currentTimeSpan = {
            start: shift.get('start'),
            end: DateUtils.addHours(shift.get('start') as Date, 1)
        } as TimeSpan;
        while (currentTimeSpan.end <= shift.get('end')) {

            const payoutConfigForCurrentRange = payoutConfigs.find(config => {
                return TimeSpanUtils.datesAreOverlap(config.get('start') as Date, config.get('end') as Date,
                    currentTimeSpan.start, currentTimeSpan.end);
            });
            if (payoutConfigForCurrentRange) {
                // there was a payout config found for this range
                payoutHourItems.push({
                    timeSpan: currentTimeSpan,
                    rate: payoutConfigForCurrentRange.get('hourlyRate')
                });
            }
            currentTimeSpan = {
                start: currentTimeSpan.end,
                end: DateUtils.addHours(currentTimeSpan.end, 1)
            } as TimeSpan;
        }
        return payoutHourItems;
    }

    async getEventById(eventId: string) {
        const query = new Parse.Query(Parse.Object.extend('Event'));
        const event = await query.get(eventId, { useMasterKey: true });
        return event;
    }

    public async getPayoutConfigsForEvent(eventId: string) {
        const query = new Parse.Query(Parse.Object.extend('PayoutConfig'));
        query.equalTo('event', await this.getEventById(eventId));
        query.ascending('start');
        query.include('event');
        query.limit(10000);
        return await query.find({ useMasterKey: true });
    }
}