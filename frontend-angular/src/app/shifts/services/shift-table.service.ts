import { Injectable } from "@angular/core";
import { DateUtils } from "ngx-fluffy-cow";
import * as Parse from 'parse';
import { TimeSpan, TimeSpanUtils } from "src/app/shift-common/utils/timespan.utils";
import { ShiftService } from "./shift.service";
import * as Colors from 'tailwindcss/colors';
import { EventService } from "src/app/shift-common/services/event.service";
export interface ShiftTable {
    headerTimeSlots: TimeSpan[];
    categories: ShiftTableCategory[];
}

export interface ShiftTableCategory {
    category: Parse.Object<Parse.Attributes>;
    shifts: TableShift[];
    userWishs?: TableUserShiftWish[]
}

export interface TableUserShiftWish {
    marginLeftPx: number;
    widthPx: number;
    isOverlapping: boolean;
    shift: Parse.Object<Parse.Attributes>;
}

export interface TableShift {
    selected: boolean;
    marginLeftPx: number;
    widthPx: number;
    isOverlapping: boolean;
    shift: Parse.Object<Parse.Attributes>;
}

export interface UserColor {
    user: Parse.Object<Parse.Attributes>;
    colorCode: string;
}

@Injectable()
export class ShiftTableService {

    minuteInterval = 60; // todo make this as event param
    widthInterval = 50; // width in px

    event?: Parse.Object<Parse.Attributes>;
    shifts?: Parse.Object<Parse.Attributes>[];
    userShifts?: Parse.Object<Parse.Attributes>[];
    userColorMap = new Map<string, string>(); // userId, color
    userColors: UserColor[] = [];
    private tailwindColors = this.initTailwindColors();

    constructor(private shiftService: ShiftService,
        private readonly eventService: EventService) { }

    public async initByEventId(eventId: string) {
        this.event = await this.shiftService.getEvent(eventId);
        this.shifts = await this.shiftService.getShiftsForEvent(this.event);
        this.userShifts = await this.shiftService.getShiftsBookingsForEvent(this.event);

        this.userColors = [];
        this.userColorMap = new Map<string, string>();
        const allUserIds = [...new Set(this.userShifts.map(x => x.get('user').id))] as string[];
        allUserIds.forEach((userId, index) => {
            const colorIndex = index % (this.tailwindColors.length - 1);
            this.userColorMap.set(userId, this.tailwindColors[colorIndex]);
            this.userColors.push({
                colorCode: this.tailwindColors[colorIndex],
                user: this.userShifts?.find(userShift => userShift.get('user').id === userId)?.get('user')
            });
        });
    }

    initTailwindColors() {
        // const colorNames = Object.keys(Colors);
        const colorNames = ['red', 'green', 'blue', 'orange', 'purple', 'pink', 'yellow', 'amber', 'lime', 'emerald', 'teal',
            'cyan', 'sky', 'indigo', 'violet', 'fuchsia', 'rose'];
        return colorNames.map(color => (Colors as any)[color]['300']).filter(colorCode => !!colorCode);
    }

    async calculateShiftTable(includeWishes = false) {
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
        const [categories, userShiftWishForEvent, userEventCategories] = await Promise.all([
            this.eventService.getEventCategories(this.event.id),
            this.fetchAllUserShiftWishForEvent(),
            this.eventService.fetchAllUserEventCategory(this.event.id)
        ])
        const eventTimeSlots = this.buildHeaderTimeSlots();
        const shiftTableCategories = await new Promise(resolve => resolve(
            categories.map(category => {
                return {
                    category,
                    shifts: this.buildCategoryTimeSlots(category),
                    userWishs: includeWishes ? this.buildUserWishesForCategory(category, userShiftWishForEvent, userEventCategories) : []
                } as ShiftTableCategory;
            })
        ));
        return {
            categories: shiftTableCategories,
            headerTimeSlots: eventTimeSlots
        } as ShiftTable;
    }

    buildUserWishesForCategory(category: Parse.Object<Parse.Attributes>, userShiftWishForEvent: Parse.Object<Parse.Attributes>[],
        userEventCategories: Parse.Object<Parse.Attributes>[]): TableUserShiftWish[] {

        const usersWithThisCategory = userEventCategories.filter(userEventCategory =>
            userEventCategory.get('category').id === category.id)
            .map(userEventCategory => userEventCategory.get('user').id);

        return userShiftWishForEvent.filter(userShiftWish => usersWithThisCategory.includes(userShiftWish.get('user').id))
            .map(userShiftWish => {
                const userThimeShift = {} as TableUserShiftWish;
                userThimeShift.shift = userShiftWish;
                return this.calculatePxForUserShift(userThimeShift);
            });
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
            const userThimeShift = {} as TableShift;
            userThimeShift.shift = userShift;
            return this.calculatePxForUserShift(userThimeShift);
        });
    }

    public calculatePxForUserShift<TInOutType extends TableShift | TableUserShiftWish>(userThimeShift: TInOutType): TInOutType {
        if (!this.event) {
            return undefined as any;
        }
        const eventStart = this.event.get('start');
        const eventEnd = this.event.get('end');
        const shiftStart = userThimeShift.shift.className === 'UserShift' ? userThimeShift.shift.get('start') : userThimeShift.shift.get('shift').get('start');
        const shiftEnd = userThimeShift.shift.className === 'UserShift' ? userThimeShift.shift.get('end') : userThimeShift.shift.get('shift').get('end');

        const diferenceToStartOfEventInMin = TimeSpanUtils.getMinutesBetweenDates(eventStart, shiftStart);
        const timeSlotsBeforeShiftCount = shiftStart.getTime() < eventStart.getTime() ? 0 : Math.floor(diferenceToStartOfEventInMin / this.minuteInterval);

        let userShiftDurationInMinutes = eventEnd.getTime() < shiftEnd.getTime() ? TimeSpanUtils.getMinutesBetweenDates(shiftStart, eventEnd) : TimeSpanUtils.getMinutesBetweenDates(shiftStart, shiftEnd);
        const timeSlotsForUserShiftCount = Math.floor(userShiftDurationInMinutes / this.minuteInterval);

        userThimeShift.marginLeftPx = timeSlotsBeforeShiftCount * this.widthInterval + 0 * timeSlotsBeforeShiftCount;
        userThimeShift.widthPx = timeSlotsForUserShiftCount * this.widthInterval + 0 * timeSlotsForUserShiftCount;
        return userThimeShift;
    }

    public async fetchAllUserShiftWishForEvent() {
        if (!this.event) {
            return [];
        }
        const query = new Parse.Query(Parse.Object.extend('UserShiftWish'));
        query.equalTo('event', this.event);
        query.include('event');
        query.include('user');
        query.include('shift');
        query.limit(10000);
        return await query.find();
    }
}