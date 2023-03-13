import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-volunteer-multiple-chooser-overlay',
  templateUrl: './volunteer-multiple-chooser-overlay.component.html'
})
export class VolunteerMultipleChooserOverlayComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public eventId: string) {}
  selectedValues: Parse.Object[] = [];
}
