import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'shift-toggle-switch',
  templateUrl: './toggle-switch.component.html'
})
export class ToggleSwitchComponent {

  @Input() label?: string;
  @Input() value = false;
  @Output() valueChange = new EventEmitter<boolean>();

  checkboxChange($event: Event) {
    const checkboxElement = $event.target as HTMLInputElement;
    this.value = checkboxElement.checked;
    this.valueChange.emit(this.value);
  }
}
