import { Injectable } from "@angular/core";
import { DateUtils } from "ngx-fluffy-cow";
import * as Parse from 'parse';
import { CommonService } from "src/app/shift-common/services/common.service";
import { TimeSpan, TimeSpanUtils } from "src/app/shift-common/utils/timespan.utils";

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

@Injectable()
export class PayoutService {

    constructor(private commonService: CommonService) { }

    public async getPayoutConfigsForEvent(eventId: string) {
        const query = new Parse.Query(Parse.Object.extend('PayoutConfig'));
        query.equalTo('event', await this.commonService.eventService.getEventById(eventId, true));
        query.ascending('start');
        query.include('event');
        query.limit(10000);
        return await query.find();
    }
}