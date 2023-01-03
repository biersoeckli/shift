import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShiftDetailEditComponent } from './shift-detail-edit/shift-detail-edit.component';
import { ShiftCommonModule } from '../shift-common/shift-common.module';
import { RouterModule, Routes } from '@angular/router';
import { ShiftOverviewComponent } from './shift-overview/shift-overview.component';
import { ShiftService } from './services/shift.service';


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
    ShiftDetailEditComponent,
    ShiftOverviewComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    RouterModule.forChild(routes)
  ], 
  exports: [ShiftOverviewComponent],
  providers: [
    ShiftService
  ]
})
export class ShiftsModule { }
