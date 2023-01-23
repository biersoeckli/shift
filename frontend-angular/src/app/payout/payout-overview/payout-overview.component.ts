import { Component } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { PayoutParams } from '../payout.params';
import { PayoutCalculationService } from '../services/payout-calculation.service';
import * as Parse from 'parse';

@Component({
  selector: 'app-payout-overview',
  templateUrl: './payout-overview.component.html'
})
export class PayoutOverviewComponent extends BaseComponent<PayoutParams> {

  payoutConfigs?: Parse.Object<Parse.Attributes>[];

  constructor(common: CommonService,
    private payoutService: PayoutCalculationService) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  private async init() {
    this.payoutConfigs = await this.payoutService.getPayoutConfigsForEvent(this.params.eventId);
  }

  @fluffyLoading()
  async deleteItem(payoutConfig: Parse.Object<Parse.Attributes>) {
    if (!confirm(`Willst du die Payment Config wirklich löschen?`)) {
      return;
    }
    await payoutConfig?.destroy();
    await this.init();
  }
}
