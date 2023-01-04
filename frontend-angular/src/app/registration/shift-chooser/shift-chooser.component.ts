import { Component } from '@angular/core';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { ShiftService, ShiftWithWishBooking } from 'src/app/shifts/services/shift.service';
import { RegistrationParams } from '../registration.params';
import * as Parse from 'parse';

@Component({
  selector: 'app-shift-chooser',
  templateUrl: './shift-chooser.component.html'
})
export class ShiftChooserComponent extends BaseComponent<RegistrationParams> {

  event?: Parse.Object<Parse.Attributes>;
  bookings?: ShiftWithWishBooking[];

  deleteList: Parse.Object<Parse.Attributes>[] = [];

  constructor(common: CommonService,
    private readonly shiftService: ShiftService) {
    super(common);
    this.init();
  }

  async init() {
    this.event = await this.shiftService.getEvent(this.params.eventId);
    this.bookings = await this.shiftService.getShiftsWithWishBookings(this.params.eventId);
  }

  async onSchichtClick(booking: ShiftWithWishBooking) {
    if (booking.booking) {
      this.deleteList.push(booking.booking);
      booking.booking = undefined;
    } else {
      booking.booking = this.create(booking.shift);
    }
  }

  create(shift: Parse.Object<Parse.Attributes>) {
    const object = new (Parse.Object.extend("UserShiftWish"));
    object.set('event', this.event);
    object.set('user', Parse.User.current());
    object.set('shift', shift);
    return object;
  }

  async save() {
    // todo
    await Parse.Object.destroyAll(this.deleteList);
  }
}
