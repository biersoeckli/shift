import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'shift-back-arrow',
  templateUrl: './back-arrow.component.html'
})
export class BackArrowComponent {
  @Input() title?: string;
  @Output() backClick = new EventEmitter<void>();
}
