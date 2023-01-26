import { Component, ElementRef, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HtmlContentExporterService } from '../shift-common/services/html-content-exporter.service';

export interface GlobalDialogParams {
  title: string;
  text: string;
  okButton?: string;
}

@Component({
  selector: 'app-global-alert',
  templateUrl: './global-alert.component.html'
})
export class GlobalAlertComponent {
  constructor(public dialogRef: MatDialogRef<GlobalAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public alertParams: GlobalDialogParams) {
    alertParams.okButton ??= 'OK';
  }
}
