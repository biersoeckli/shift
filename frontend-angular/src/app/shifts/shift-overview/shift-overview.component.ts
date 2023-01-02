import { Component, Input, OnInit } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import * as Parse from 'parse';

export interface ShiftWithBookings {
  shift: Parse.Object<Parse.Attributes>;
  bookings: Parse.Object<Parse.Attributes>[];
}

@Component({
  selector: 'shifts-overview',
  templateUrl: './shift-overview.component.html'
})
export class ShiftOverviewComponent extends BaseComponent<void> implements OnInit {

  @Input() eventId?: string;
  event?: Parse.Object<Parse.Attributes>;
  shiftWithBookings?: ShiftWithBookings[];

  constructor(common: CommonService) {
    super(common);
  }

  @fluffyLoading()
  async ngOnInit() {
    this.event = await this.getEvent();
    if (!this.event) {
      return;
    }
    const [userShifts, allShifts] = await Promise.all([this.getShiftsBookingsForEvent(), this.getShiftsForEvent()]);
    this.shiftWithBookings = allShifts.map(shift => {
      return {
        shift,
        bookings: userShifts.filter(userShift => userShift.get('shift').id === shift.id)
      } as ShiftWithBookings;
    })
  }

  private async getEvent(): Promise<Parse.Object<Parse.Attributes> | undefined> {
    if (!this.eventId) {
      return;
    }
    const query = new Parse.Query(Parse.Object.extend('Event'));
    return await query.get(this.eventId);
  }

  private async getShiftsForEvent(): Promise<Parse.Object<Parse.Attributes>[]> {
    const query = new Parse.Query(Parse.Object.extend('Shift'));
    query.equalTo('event', this.event);
    query.include('event');
    return await query.find();
  }

  private async getShiftsBookingsForEvent(): Promise<Parse.Object<Parse.Attributes>[]> {
    const query = new Parse.Query(Parse.Object.extend('UserShift'));
    query.equalTo('event', this.event);
    query.include('event');
    query.include('user');
    query.include('shift');
    return await query.find();
  }
}
