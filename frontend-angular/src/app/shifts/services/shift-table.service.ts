import { Injectable } from "@angular/core";
import { DateUtils } from "ngx-fluffy-cow";
import * as Parse from 'parse';
import { TimeSpan, TimeSpanUtils } from "src/app/shift-common/utils/timespan.utils";
import { ShiftService } from "./shift.service";

export interface ShiftTable {
    headerTimeSlots: TimeSpan[];
    categories: ShiftTableCategory[];
}

export interface ShiftTableCategory {
    category: Parse.Object<Parse.Attributes>;
    shifts: TableShift[];
}

export interface TableShift {
    marginLeftPx: number;
    widthPx: number;
    shift: Parse.Object<Parse.Attributes>;
}

@Injectable()
export class ShiftTableService {

    minuteInterval = 60; // todo make this as event param
    widthInterval = 100; // width in px

    event?: Parse.Object<Parse.Attributes>;
    shifts?: Parse.Object<Parse.Attributes>[];
    userShifts?: Parse.Object<Parse.Attributes>[];

    constructor(private shiftService: ShiftService) { }

    public async initByEventId(eventId: string) {
        this.event = await this.shiftService.getEvent(eventId);
        this.shifts = await this.shiftService.getShiftsForEvent(this.event);
        this.userShifts = await this.shiftService.getShiftsBookingsForEvent(this.event);
    }

    async calculateShiftTable() {
        if (!this.event) {
            return;
        }

        // todo make this nice
        const startDate = this.event.get('start') as Date;
        const endDate = this.event.get('end') as Date;
        const diffTime = Math.abs(startDate.getTime() - endDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 10) {
            // cannot render, because is too many slots
            return;
        }

        const categories = await this.fetchAllCategories();
        const eventTimeSlots = this.buildHeaderTimeSlots();
        const shiftTableCategories = await new Promise(resolve => resolve(
            categories.map(category => {
                return {
                    category,
                    shifts: this.buildCategoryTimeSlots(category)
                } as ShiftTableCategory;
            })
        ));
        return {
            categories: shiftTableCategories,
            headerTimeSlots: eventTimeSlots
        } as ShiftTable;
    }

    buildHeaderTimeSlots(): TimeSpan[] {
        if (!this.event) {
            return [];
        }
        const result: TimeSpan[] = [];

        const startDate = this.event.get('start') as Date;
        const endDate = this.event.get('end') as Date;
        let counterDate = new Date(startDate);

        while (counterDate.getTime() < endDate.getTime()) {
            // evaluating end of current timespan range
            const nextDate = DateUtils.addMinutes(counterDate, this.minuteInterval) as Date;
            const timeSpan = {
                start: counterDate,
                end: nextDate
            } as TimeSpan;

            result.push(timeSpan);
            counterDate = nextDate;
        }

        return result;
    }

    buildCategoryTimeSlots(category: Parse.Object<Parse.Attributes>): TableShift[] {
        if (!this.event) {
            return [];
        }

        const userShifts = this.userShifts?.filter(userShift =>
            userShift.get('category')?.id === category.id) ?? [];

        return userShifts.map(userShift => {
            const diferenceToStartOfEventInMin = TimeSpanUtils.getMinutesBetweenDates(this.event?.get('start'), userShift.get('start'));
            const timeSlotsBeforeShiftCount = Math.floor(diferenceToStartOfEventInMin / this.minuteInterval);

            const userShiftDurationInMinutes = TimeSpanUtils.getMinutesBetweenDates(userShift.get('start'), userShift.get('end'));
            const timeSlotsForUserShiftCount = Math.floor(userShiftDurationInMinutes / this.minuteInterval);

            return {
                marginLeftPx: timeSlotsBeforeShiftCount * this.widthInterval + 2 * timeSlotsBeforeShiftCount,
                widthPx: timeSlotsForUserShiftCount * this.widthInterval + 2 * timeSlotsForUserShiftCount,
                shift: userShift
            } as TableShift;
        })
    }

    async fetchAllCategories() {
        const query = new Parse.Query(Parse.Object.extend('EventCategory'));
        query.equalTo('event', this.event);
        query.ascending('name');
        return await query.find();
    }
}