import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShiftDetailEditComponent } from './shift-detail-edit/shift-detail-edit.component';
import { ShiftCommonModule } from '../shift-common/shift-common.module';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'shifts',
    component: ShiftDetailEditComponent,
  },{
    path: 'shifts/detail',
    component: ShiftDetailEditComponent,
  },{
    path: 'shifts/detail/edit',
    component: ShiftDetailEditComponent,
  }
];

@NgModule({
  declarations: [
    ShiftDetailEditComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ShiftsModule { }
