import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShiftDetailEditComponent } from './shift-detail-edit/shift-detail-edit.component';
import { ShiftCommonModule } from '../shift-common/shift-common.module';
import { RouterModule, Routes } from '@angular/router';
import { ShiftOverviewComponent } from './shift-overview/shift-overview.component';
import { ShiftService } from './services/shift.service';
import { ShiftTableComponent } from './shift-table/shift-table.component';
import { ShiftTableService } from './services/shift-table.service';
import { UserPickerDialogComponent } from './user-picker-dialog/user-picker-dialog.component';
import {MatMenuModule} from '@angular/material/menu';
import { VolunteerModule } from '../volunteer/volunteer.module';
import { ShiftTablePrintOverlayComponent } from './shift-table-print-overlay/shift-table-print-overlay.component';


const routes: Routes = [
  {
    path: 'shifts',
    component: ShiftOverviewComponent,
  }, {
    path: 'shifts/detail/edit',
    component: ShiftDetailEditComponent,
  }
];

@NgModule({
  declarations: [
    ShiftDetailEditComponent,
    ShiftOverviewComponent,
    ShiftTableComponent,
    UserPickerDialogComponent,
    ShiftTablePrintOverlayComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    MatMenuModule,
    VolunteerModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    ShiftTableComponent
  ],
  providers: [
    ShiftService,
    ShiftTableService
  ]
})
export class ShiftsModule { }
