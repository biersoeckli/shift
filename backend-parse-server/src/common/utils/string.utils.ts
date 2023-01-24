import { DateUtils } from "./date.utils";

export class StringUtils {
    public static isEmpty(value: string) {
        return !value || value.split(' ').join('').length === 0;
    }

    public static isNotEmpty(value: string) {
        return !this.isEmpty(value);
    }

    public static fromTo(from: Date, to: Date, showDateOnFirst = false): string {
        if (!from || !to) {
            return '';
        }
        return 'todo';
        /*
        let returnVal = '';
        if (showDateOnFirst) {
            returnVal = `${} `;
        }
        if (DateUtils.isSameDay(from, to)) {
            returnVal += `${this.timePipe.transform(from)} - ${this.timePipe.transform(to)}`;
        } else {
            returnVal += `${this.timePipe.transform(from)} - ${this.dateTimePipe.transform(to)}`;
        }
        return returnVal;*/
    }
}
