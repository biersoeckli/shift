import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DateUtils } from 'ngx-fluffy-cow';

@Component({
  selector: 'shift-date-input',
  templateUrl: './date-input.component.html'
})
export class DateInputComponent {

  @Input() label?: string;
  @Input() set date(value: Date) {
    if (!value) {
      return;
    }
    this.dateString =  DateUtils.toDateInputString(value);
  }
  @Output() dateChange = new EventEmitter<Date>(undefined);

  dateString: any;

  onDateInputChanged(event: any) {
    const date = DateUtils.parseDateFromDateInput(event.target.value); 
    this.dateChange.emit(date);
  }
}
