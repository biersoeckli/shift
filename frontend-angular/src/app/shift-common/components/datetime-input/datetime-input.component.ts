import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DateUtils } from 'ngx-fluffy-cow';

@Component({
  selector: 'shift-datetime-input',
  templateUrl: './datetime-input.component.html'
})
export class DatetimeInputComponent {

  @Input() label?: string;
  @Input() set date(value: Date) {
    if (!value) {
      return;
    }
    this.dateString =  DateUtils.toDateString(value);
  }
  @Output() dateChange = new EventEmitter<Date>(undefined);

  dateString: any;

  onDateInputChanged(event: any) {
    const date = DateUtils.parseDateString(event.target.value);    
    this.dateChange.emit(date);
  }
}
