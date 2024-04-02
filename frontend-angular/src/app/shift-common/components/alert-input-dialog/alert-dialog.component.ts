import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'shift-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss']
})
export class AlertInputDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AlertInputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AlertInputDialogData) {
  }

  close(): void {
    this.dialogRef.close(this.data.value);
  }
}

export interface AlertInputDialogData {
  title: string;
  text: string;
  placeholder: string;
  value: string;
}
