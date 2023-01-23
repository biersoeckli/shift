import { Injectable } from "@angular/core";
import { DateUtils } from "ngx-fluffy-cow";
import * as Parse from 'parse';
import { CommonService } from "src/app/shift-common/services/common.service";
import { TimeSpan, TimeSpanUtils } from "src/app/shift-common/utils/timespan.utils";


export interface ShiftPayoutInfo {
    shift: Parse.Object<Parse.Attributes>,
    payoutHourItems: PayoutHourItem[],
    shiftPayoutTotal: number,
}

interface PayoutHourItem {
    timeSpan: TimeSpan,
    rate: number
}

@Injectable()
export class PayoutCalculationService {

    constructor(private commonService: CommonService) { }

    public async getPayoutConfigsForEvent(eventId: string) {
        const query = new Parse.Query(Parse.Object.extend('PayoutConfig'));
        query.equalTo('event', await this.commonService.eventService.getEventById(eventId, true));
        query.ascending('start');
        query.include('event');
        query.limit(10000);
        return await query.find();
    }

    public async getUserShiftsForEventAndUser(userId: string, eventId: string) {
        const query = new Parse.Query(Parse.Object.extend('UserShift'));
        query.equalTo('event', await this.commonService.eventService.getEventById(eventId, true));
        query.equalTo('user', await this.commonService.getUserById(userId));
        query.include('event');
        query.include('user');
        query.include('shift');
        query.limit(100000);
        return await query.find();
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
                return TimeSpanUtils.timesDoOverlap(config.get('start') as Date, config.get('end') as Date, currentTimeSpan);
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
}