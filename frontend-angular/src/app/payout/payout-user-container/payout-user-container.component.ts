import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { PayoutService, UserPayoutInfo } from '../services/payout.service';
import * as Parse from 'parse';
import { fluffyCatch } from 'ngx-fluffy-cow';

@Component({
  selector: 'shift-payout-user-container',
  templateUrl: './payout-user-container.component.html'
})
export class PayoutUserContainerComponent extends BaseComponent<void> implements OnInit {

  @Input() userId?: string;
  @Input() eventId?: string;

  userPayoutInfo?: UserPayoutInfo;

  constructor(common: CommonService) {
    super(common);
  }

  async ngOnInit() {
    if (!this.eventId || !this.userId) {
      return;
    }
    this.userPayoutInfo = (await Parse.Cloud.run('calculateUserPayoutInfoForEvent',
      { userId: this.userId, eventId: this.eventId })) ?? [];
  }
}
