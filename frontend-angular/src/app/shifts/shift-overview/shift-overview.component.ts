import { Component, Input, OnInit } from '@angular/core';
import { fluffyCatch, fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import * as Parse from 'parse';
import { ShiftService, ShiftWithBookings } from '../services/shift.service';
import { ShiftDetailParams } from '../shift-detail-edit/shift-detail.params';

@Component({
  selector: 'shifts-overview',
  templateUrl: './shift-overview.component.html'
})
export class ShiftOverviewComponent extends BaseComponent<ShiftDetailParams> implements OnInit {

  shiftWithBookings?: ShiftWithBookings[];

  constructor(common: CommonService,
    private readonly shiftService: ShiftService) {
    super(common);
  }

  @fluffyLoading()
  @fluffyCatch()
  async ngOnInit() {
    if (!this.params.eventId) {
      return;
    }
    this.shiftWithBookings = await this.shiftService.getShiftsWithBookings(this.params.eventId);
  }
}
