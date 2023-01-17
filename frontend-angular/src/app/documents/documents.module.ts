import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventDocumentContainerComponent } from './event-document-container/event-document-container.component';
import { EventDocumentUploadOverlayComponent } from './event-document-upload-overlay/event-document-upload-overlay.component';
import { ShiftCommonModule } from '../shift-common/shift-common.module';



@NgModule({
  declarations: [
    EventDocumentContainerComponent,
    EventDocumentUploadOverlayComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule
  ],
  exports: [
    EventDocumentContainerComponent
  ]
})
export class DocumentsModule { }
