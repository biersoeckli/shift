import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationComponent } from './registration.component';
import { RouterModule, Routes } from '@angular/router';
import { ShiftCommonModule } from '../shift-common/shift-common.module';


const routes: Routes = [
  {
    path: '',
    component: RegistrationComponent,
  }
];

@NgModule({
  declarations: [
    RegistrationComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    RouterModule.forChild(routes),
  ]
})
export class RegistrationModule { }
