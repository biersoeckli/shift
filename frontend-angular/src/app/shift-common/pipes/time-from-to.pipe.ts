import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { DateUtils, FluffyDatePipe, FluffyDateTimePipe, FluffyTimePipe } from 'ngx-fluffy-cow';

@Pipe({ name: 'fromToTime' })
export class TimeFromToPipe implements PipeTransform {

    private timePipe = new FluffyTimePipe();

    transform(from: Date, to: Date): string {
        if (!from || !to) {
            return '';
        }
        return `${this.timePipe.transform(from)} - ${this.timePipe.transform(to)}`;
    }
}