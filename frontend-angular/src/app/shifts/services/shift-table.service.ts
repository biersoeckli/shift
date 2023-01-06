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
    timeSlots: TableTimeSlot[];
}

export interface TableTimeSlot {
    timeSpan: TimeSpan;
    userShifts: Parse.Object<Parse.Attributes>[];
    availableUsers?: Parse.Object<Parse.Attributes>[];
}

@Injectable()
export class ShiftTableService {

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
                    timeSlots: this.buildCategoryTimeSlots(category, eventTimeSlots)
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

        const minuteInterval = 60; // todo make this as event param
        const startDate = this.event.get('start') as Date;
        const endDate = this.event.get('end') as Date;
        let counterDate = new Date(startDate);

        while (counterDate.getTime() < endDate.getTime()) {
            // evaluating end of current timespan range
            const nextDate = DateUtils.addMinutes(counterDate, minuteInterval) as Date;
            const timeSpan = {
                start: counterDate,
                end: nextDate
            } as TimeSpan;

            result.push(timeSpan);
            counterDate = nextDate;
        }

        return result;
    }

    buildCategoryTimeSlots(category: Parse.Object<Parse.Attributes>, timeSpans: TimeSpan[]): TableTimeSlot[] {
        if (!this.event) {
            return [];
        }
        return timeSpans.map(timeSpan => {
            return {
                timeSpan,
                userShifts: this.evaluateUserShiftForTimeSpan(timeSpan) // todo use ccategories to load user shifts
            } as TableTimeSlot;
        })
    }

    evaluateUserShiftForTimeSpan(timeSpan: TimeSpan): Parse.Object<Parse.Attributes>[] {
        return this.userShifts?.filter(userShift =>
            TimeSpanUtils.isOverlapping(timeSpan, {
                start: userShift.get('start'),
                end: userShift.get('end')
            })) ?? [];
    }

    async fetchAllCategories() {
        const query = new Parse.Query(Parse.Object.extend('EventCategory'));
        query.equalTo('event', this.event);
        query.ascending('name');
        return await query.find();
    }
}