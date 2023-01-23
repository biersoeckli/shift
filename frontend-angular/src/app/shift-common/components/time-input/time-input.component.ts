import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FluffyTimePipe } from 'ngx-fluffy-cow';

@Component({
  selector: 'shift-time-input',
  templateUrl: './time-input.component.html'
})
export class TimeInputComponent {

  private timePipe = new FluffyTimePipe();
  @Input() label?: string;
  @Input() set date(value: Date) {
    if (!value) {
      return;
    }
    this.dateString = this.timePipe.transform(value);
  }
  @Output() dateChange = new EventEmitter<Date>(undefined);

  dateString: any;

  onDateInputChanged(event: any) {
    const inputVal = (event.target.value as string);
    if (!inputVal || !inputVal.includes(':')) {
      this.dateChange.emit(undefined);
      return;
    }
    const splittedValues = inputVal.split(':');
    const date = new Date();
    date.setHours(+splittedValues[0]);
    date.setMinutes(+splittedValues[1]);
    date.setSeconds(0);
    date.setMilliseconds(0);
    this.dateChange.emit(date);
  }
}
