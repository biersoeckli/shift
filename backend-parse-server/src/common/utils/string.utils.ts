import { DateUtils } from "./date.utils";
import dateFormatter from 'date-and-time';

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
        let returnVal = '';
        if (showDateOnFirst) {
            returnVal = `${this.formatDate(from)} `;
        }
        if (DateUtils.isSameDay(from, to)) {
            returnVal += `${this.formatTime(from)} - ${this.formatTime(to)}`;
        } else {
            returnVal += `${this.formatTime(from)} - ${this.formatDateTime(to)}`;
        }
        return returnVal;
    }

    public static formatTime(date: Date, addSeconds = false) {
        return dateFormatter.format(date, addSeconds ? 'HH:mm:ss' : 'HH:mm');
    }

    public static formatDate(date: Date) {
        return dateFormatter.format(date, 'DD.MM.YYYY');
    }

    public static formatDateTime(date: Date, addSeconds = false) {
        return this.formatDate(date) + ' ' + this.formatTime(date, addSeconds);
    }

    public static replaceAll(str: string, find: string, replace: string) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
}
