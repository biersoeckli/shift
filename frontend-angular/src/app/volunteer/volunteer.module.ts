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
    path: 'volunteers/contract-config/edit',
    component: VolunteerContractConfigEditComponent,
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
    VolunteerExportOverlayComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    DocumentsModule,
    PayoutModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    VolunteerListComponent,
    VolunteerEditFormComponent
  ]
})
export class VolunteerModule { }
