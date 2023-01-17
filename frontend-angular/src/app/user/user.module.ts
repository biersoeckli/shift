import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ShiftCommonModule } from '../shift-common/shift-common.module';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserEventDetailComponent } from './user-event-detail/user-event-detail.component';
import { DocumentsModule } from '../documents/documents.module';

const routes: Routes = [
  {
    path: 'user/event',
    component: UserEventDetailComponent,
  }, {
    path: 'user/profile',
    component: UserProfileComponent,
  }
];

@NgModule({
  declarations: [
    UserProfileComponent,
    UserEventDetailComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    DocumentsModule,
    RouterModule.forChild(routes)
  ]
})
export class UserModule { }
