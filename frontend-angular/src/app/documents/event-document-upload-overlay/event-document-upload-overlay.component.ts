import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fluffyLoading } from 'ngx-fluffy-cow';
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

  selectedFiles: File[] = [];

  constructor(public dialogRef: MatDialogRef<EventDocumentUploadOverlayComponent>,
    @Inject(MAT_DIALOG_DATA) public input: EventDocumentUploadOverlayInput) {

  }

  onFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files as FileList ?? [];
    this.selectedFiles = this.selectedFiles.concat(Array.from(files));
  }

  removeFile(fileToRemove: File) {
    if (!fileToRemove) {
      return;
    }
    this.selectedFiles = this.selectedFiles.filter(selFile => selFile !== fileToRemove);
  }

  @fluffyLoading()
  async upload() {
    const parseFiles = this.selectedFiles.map(file => {
      const parseFile = new Parse.File(file.name, file, file.type);

      const parseObject = new (Parse.Object.extend('EventDocument'));
      parseObject.set('file', parseFile);
      parseObject.set('name', file.name);
      parseObject.set('type', file.type);
      parseObject.set('event', this.input.event);
      parseObject.set('user', this.input.user);
      return parseObject as Parse.Object<Parse.Attributes>;
    });
    await Parse.Object.saveAll(parseFiles);
    await this.dialogRef.close();
  }
}
