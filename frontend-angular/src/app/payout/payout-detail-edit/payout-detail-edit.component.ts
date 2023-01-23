import { Component } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { BaseEditComponent } from 'src/app/shift-common/base-edit-component/base-edit-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { PayoutParams } from '../payout.params';
import * as Parse from 'parse';

@Component({
  selector: 'app-payout-detail-edit',
  templateUrl: './payout-detail-edit.component.html'
})
export class PayoutDetailEditComponent extends BaseEditComponent<PayoutParams> {

  event?: Parse.Object<Parse.Attributes>;

  constructor(common: CommonService) {
    super(common, 'PayoutConfig', 'payoutConfigId');
    this.loadEvent();
    this.beforeSaveAction = unsavedItem => {
      unsavedItem.set('event', this.event);
      return unsavedItem;
    }
    this.afterSaveAction = savedItem => this.navigation.payoutConfigOverview(savedItem.get('event').id);
  }

  @fluffyLoading()
  async loadEvent() {
    this.event = await this.eventService.getEventById(this.params.eventId, true);
    if (!this.params.payoutConfigId) {
      this.item?.set('start', this.event.get('start'));
      this.item?.set('end', this.event.get('end'));
    }
  }
}
