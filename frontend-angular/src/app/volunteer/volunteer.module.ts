import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolunteerListComponent } from './volunteer-list/volunteer-list.component';
import { VolunteerOverviewComponent } from './volunteer-overview/volunteer-overview.component';
import { VolunteerDetailComponent } from './volunteer-detail/volunteer-detail.component';
import { VolunteerDetailEditComponent } from './volunteer-detail-edit/volunteer-detail-edit.component';
import { ShiftCommonModule } from '../shift-common/shift-common.module';
import { Routes, RouterModule } from '@angular/router';
import { VolunteerEditFormComponent } from './volunteer-edit-form/volunteer-edit-form.component';
import { DocumentsModule } from '../documents/documents.module';
import { PayoutModule } from '../payout/payout.module';
import { VolunteerContractConfigEditComponent } from './volunteer-contract-config-edit/volunteer-contract-config-edit.component';
import { VolunteerExportOverlayComponent } from './volunteer-export-overlay/volunteer-export-overlay.component';
import { VolunteerAssigmentSuggestionComponent } from './volunteer-assigment-suggestion/volunteer-assigment-suggestion.component';
import { MatMenuModule } from '@angular/material/menu';
import { VolunteerMultipleChooserOverlayComponent } from './volunteer-multiple-chooser-overlay/volunteer-multiple-chooser-overlay.component';
import { VolunteerContractMenuComponent } from './volunteer-contract-menu/volunteer-contract-menu.component';
import { VolunteerContractMailSenderComponent } from './volunteer-contract-mail-sender/volunteer-contract-mail-sender.component';
import { VolunteerMessageOverlayComponent } from './volunteer-message-overlay/volunteer-message-overlay.component';

const routes: Routes = [
  {
    path: 'volunteers',
    component: VolunteerOverviewComponent,
  }, {
    path: 'volunteers/detail',
    component: VolunteerDetailComponent,
  }, {
    path: 'volunteers/detail/edit',
    component: VolunteerDetailEditComponent,
  }, {
    path: 'volunteers/contract-config',
    component: VolunteerContractMenuComponent,
  }, {
    path: 'volunteers/contract-config/edit',
    component: VolunteerContractConfigEditComponent,
  }, {
    path: 'volunteers/contract-config/mail-sender',
    component: VolunteerContractMailSenderComponent,
  }
];

@NgModule({
  declarations: [
    VolunteerListComponent,
    VolunteerOverviewComponent,
    VolunteerDetailComponent,
    VolunteerDetailEditComponent,
    VolunteerEditFormComponent,
    VolunteerContractConfigEditComponent,
    VolunteerExportOverlayComponent,
    VolunteerAssigmentSuggestionComponent,
    VolunteerMultipleChooserOverlayComponent,
    VolunteerContractMenuComponent,
    VolunteerContractMailSenderComponent,
    VolunteerMessageOverlayComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    DocumentsModule,
    MatMenuModule,
    PayoutModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    VolunteerListComponent,
    VolunteerEditFormComponent,
    VolunteerAssigmentSuggestionComponent
  ]
})
export class VolunteerModule { }
