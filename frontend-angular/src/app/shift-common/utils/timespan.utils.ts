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

    static timesDoOverlap(start1: Date, end1: Date, timeSpan2: TimeSpan) {
        this.timesOfDatesDoOverlap(start1, end1, timeSpan2.start, timeSpan2.end);
    }

    static timesOfDatesDoOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
        const start1Minutes = start1.getHours() * 60 + start1.getMinutes();
        const end1Minutes = end1.getHours() * 60 + end1.getMinutes();
        const start2Minutes = start2.getHours() * 60 + start2.getMinutes();
        const end2Minutes = end2.getHours() * 60 + end2.getMinutes();
        return (start1Minutes < end2Minutes) && (start2Minutes < end1Minutes);
    }

    static isOverlapping(timeSpan1: TimeSpan, timeSpan2: TimeSpan): boolean {
        return timeSpan1?.start < timeSpan2?.end && timeSpan2?.start < timeSpan1?.end;
    }

    static getMinutesBetweenDates(startDate: Date, endDate: Date): number {
        const diffInMilliseconds = Math.abs(endDate.getTime() - startDate.getTime());
        return diffInMilliseconds / (1000 * 60);
    }
}
