import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayoutOverviewComponent } from './payout-overview/payout-overview.component';
import { PayoutDetailEditComponent } from './payout-detail-edit/payout-detail-edit.component';
import { PayoutCalculationService } from './services/payout-calculation.service';
import { ShiftCommonModule } from '../shift-common/shift-common.module';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'payout-configs',
    component: PayoutOverviewComponent,
  }, {
    path: 'payout-configs/detail/edit',
    component: PayoutDetailEditComponent,
  }
];

@NgModule({
  declarations: [
    PayoutOverviewComponent,
    PayoutDetailEditComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    PayoutCalculationService
  ]
})
export class PayoutModule { }
