import { Component, Input, OnInit } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import * as Parse from 'parse';
import { ShiftService, ShiftWithBookings } from '../services/shift.service';

@Component({
  selector: 'shifts-overview',
  templateUrl: './shift-overview.component.html'
})
export class ShiftOverviewComponent extends BaseComponent<void> implements OnInit {

  @Input() eventId?: string;
  shiftWithBookings?: ShiftWithBookings[];

  constructor(common: CommonService,
    private readonly shiftService: ShiftService) {
    super(common);
  }

  @fluffyLoading()
  async ngOnInit() {
    if (!this.eventId) {
      return;
    }
    this.shiftWithBookings = await this.shiftService.getShiftsWithBookings(this.eventId);
  }
}
