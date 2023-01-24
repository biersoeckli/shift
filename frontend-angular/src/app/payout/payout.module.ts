import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayoutOverviewComponent } from './payout-overview/payout-overview.component';
import { PayoutDetailEditComponent } from './payout-detail-edit/payout-detail-edit.component';
import { PayoutService } from './services/payout.service';
import { ShiftCommonModule } from '../shift-common/shift-common.module';
import { Routes, RouterModule } from '@angular/router';
import { PayoutUserContainerComponent } from './payout-user-container/payout-user-container.component';

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
    PayoutDetailEditComponent,
    PayoutUserContainerComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    PayoutUserContainerComponent
  ],
  providers: [
    PayoutService
  ]
})
export class PayoutModule { }
