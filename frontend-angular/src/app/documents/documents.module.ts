import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventDocumentContainerComponent } from './event-document-container/event-document-container.component';
import { EventDocumentUploadOverlayComponent } from './event-document-upload-overlay/event-document-upload-overlay.component';
import { ShiftCommonModule } from '../shift-common/shift-common.module';
import { EventDocumentsOverviewComponent } from './event-documents-overview/event-documents-overview.component';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'documents/overview',
    component: EventDocumentsOverviewComponent,
  }
];

@NgModule({
  declarations: [
    EventDocumentContainerComponent,
    EventDocumentUploadOverlayComponent,
    EventDocumentsOverviewComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    EventDocumentContainerComponent
  ]
})
export class DocumentsModule { }
