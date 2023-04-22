import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fluffyCatch, fluffyLoading } from 'ngx-fluffy-cow';
import { EventDocumentUploadOverlayComponent, EventDocumentUploadOverlayInput } from 'src/app/documents/event-document-upload-overlay/event-document-upload-overlay.component';
import { CsvExporterService } from 'src/app/shift-common/services/csv-exporter.service';
import { EventService } from 'src/app/shift-common/services/event.service';
import * as Parse from 'parse';
import { UserPayoutInfo } from 'src/app/payout/services/payout.service';

export interface VolunteerMessageOverlayComponentInput {
  userIds: string[];
  eventId: string;
}
@Component({
  selector: 'app-volunteer-message-overlay',
  templateUrl: './volunteer-message-overlay.component.html'
})
export class VolunteerMessageOverlayComponent {

  message?: string;

  constructor(public dialogRef: MatDialogRef<VolunteerMessageOverlayComponent>,
    @Inject(MAT_DIALOG_DATA) public inputData: VolunteerMessageOverlayComponentInput) {
  }

  @fluffyLoading()
  @fluffyCatch()
  async send() {
    if (!this.message) {
      return;
    }

    await Parse.Cloud.run('sendMessageToVolunteers', {
      eventId: this.inputData.eventId,
      message: this.message,
      userIds: this.inputData.userIds
    });
    this.dialogRef.close();
  }
}
