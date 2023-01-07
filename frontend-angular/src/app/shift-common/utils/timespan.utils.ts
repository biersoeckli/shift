export interface TimeSpan {
    start: Date;
    end: Date;
}

export class TimeSpanUtils {

    static datesAreOverlap(date1Start: Date, date1End: Date, date2Start: Date, date2End: Date): boolean {
        return this.isOverlapping({
            start: date1Start,
            end: date1End
        }, {
            start: date2Start,
            end: date2End
        });
    }

    static isOverlapping(timeSpan1: TimeSpan, timeSpan2: TimeSpan): boolean {
        return timeSpan1?.start < timeSpan2?.end && timeSpan2?.start < timeSpan1?.end;
    }

    static getMinutesBetweenDates(startDate: Date, endDate: Date): number {
        const diffInMilliseconds = Math.abs(endDate.getTime() - startDate.getTime());
        return diffInMilliseconds / (1000 * 60);
    }
}
