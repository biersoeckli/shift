import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ShiftCommonModule } from '../shift-common/shift-common.module';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserEventDetailComponent } from './user-event-detail/user-event-detail.component';
import { DocumentsModule } from '../documents/documents.module';
import { UserShiftOverviewComponent } from './user-shift-overview/user-shift-overview.component';
import { ShiftsModule } from '../shifts/shifts.module';
import { PayoutModule } from '../payout/payout.module';
import { UserBankAccountEditComponent } from './user-bank-account-edit/user-bank-account-edit.component';

const routes: Routes = [
  {
    path: 'user/event',
    component: UserEventDetailComponent,
  }, 
  {
    path: 'user/event/shift-table',
    component: UserShiftOverviewComponent,
  }, 
  {
    path: 'user/profile',
    component: UserProfileComponent,
  },
  {
    path: 'user/bank-account',
    component: UserBankAccountEditComponent,
  }
];

@NgModule({
  declarations: [
    UserProfileComponent,
    UserEventDetailComponent,
    UserShiftOverviewComponent,
    UserBankAccountEditComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    ShiftsModule,
    DocumentsModule,
    PayoutModule,
    RouterModule.forChild(routes)
  ]
})
export class UserModule { }
