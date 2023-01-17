import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as Parse from 'parse';

export interface EventDocumentUploadOverlayInput {
  user: Parse.Object<Parse.Attributes>,
  event: Parse.Object<Parse.Attributes>
}

@Component({
  selector: 'app-event-document-upload-overlay',
  templateUrl: './event-document-upload-overlay.component.html',
  styleUrls: ['./event-document-upload-overlay.component.scss']
})
export class EventDocumentUploadOverlayComponent {

  constructor(public dialogRef: MatDialogRef<EventDocumentUploadOverlayComponent>,
    @Inject(MAT_DIALOG_DATA) public input: EventDocumentUploadOverlayInput) {

  }
}
