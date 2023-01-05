import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { DateUtils, FluffyDatePipe, FluffyDateTimePipe, FluffyTimePipe } from 'ngx-fluffy-cow';

@Pipe({ name: 'fromTo' })
export class DateFromToPipe implements PipeTransform {

    private datePipe = new FluffyDatePipe();
    private timePipe = new FluffyTimePipe();
    private dateTimePipe = new FluffyDateTimePipe();

    transform(from: Date, to: Date, showDateOnFirst = false): string {
        if (!from || !to) {
            return '';
        }
        let returnVal = '';
        if (showDateOnFirst) {
            returnVal = `${this.datePipe.transform(from)} `;
        }
        if (DateUtils.isSameDay(from, to)) {
            returnVal += `${this.timePipe.transform(from)} - ${this.timePipe.transform(to)}`;
        } else {
            returnVal += `${this.timePipe.transform(from)} - ${this.dateTimePipe.transform(to)}`;
        }
        return returnVal;
    }
}