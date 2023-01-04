import { Component } from '@angular/core';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { ShiftService, ShiftWithWishBooking } from 'src/app/shifts/services/shift.service';
import { RegistrationParams } from '../registration.params';
import * as Parse from 'parse';
import { DateUtils, fluffyLoading } from 'ngx-fluffy-cow';
import { KeyValue } from '@angular/common';

export interface GroupedShiftsWithBooking {
  shiftWithBookings: ShiftWithWishBooking[];
  date: Date;
}

@Component({
  selector: 'app-shift-chooser',
  templateUrl: './shift-chooser.component.html'
})
export class ShiftChooserComponent extends BaseComponent<RegistrationParams> {

  originalOrder = (a: KeyValue<Date, ShiftWithWishBooking[]>, b: KeyValue<Date, ShiftWithWishBooking[]>): number => {
    return 0;
  }
  
  event?: Parse.Object<Parse.Attributes>;
  bookings?: ShiftWithWishBooking[];
  groupedBookings: Map<Date, ShiftWithWishBooking[]> = new Map<Date, ShiftWithWishBooking[]>();

  deleteList: Parse.Object<Parse.Attributes>[] = [];
  selectedBookingsCount = 0;

  constructor(common: CommonService,
    private readonly shiftService: ShiftService) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  async init() {
    this.event = await this.shiftService.getEvent(this.params.eventId);
    this.bookings = await this.shiftService.getShiftsWithWishBookings(this.params.eventId);

    //groupBookings
    const groupedBookings = new Map<Date, ShiftWithWishBooking[]>();
    this.bookings?.forEach(booking => {
      const startDate = DateUtils.getMidnight(booking.shift.get('start')) as Date;
      const bookingList4Day = groupedBookings.get(startDate);
      if (bookingList4Day) {
        bookingList4Day.push(booking);
        groupedBookings.set(startDate, bookingList4Day);
      } else {
        groupedBookings.set(startDate, [booking])
      }
    });
    this.groupedBookings = groupedBookings;
    this.selectedBookingsCount = (this.bookings?.filter(booking => booking.booking) ?? []).length;
  }

  async onSchichtClick(booking: ShiftWithWishBooking) {
    if (booking.booking) {
      if (booking.booking.id) {
        this.deleteList.push(booking.booking);
      }
      booking.booking = undefined;
    } else {
      booking.booking = this.create(booking.shift);
    }
    this.selectedBookingsCount = (this.bookings?.filter(booking => booking.booking) ?? []).length;
  }

  create(shift: Parse.Object<Parse.Attributes>) {
    const object = new (Parse.Object.extend("UserShiftWish"));
    object.set('event', this.event);
    object.set('user', Parse.User.current());
    object.set('shift', shift);
    return object;
  }

  @fluffyLoading()
  async save() {
    if (!this.bookings) {
      return;
    }
    const userShiftWishesToSave = this.bookings.filter(booking => booking.booking)
      .map(booking => booking.booking) as Parse.Object<Parse.Attributes>[];
    if (userShiftWishesToSave.length === 0) {
      return;
    }

    await Parse.Object.destroyAll(this.deleteList ?? []);
    await Parse.Object.saveAll(userShiftWishesToSave);
    await this.navigation.registrationConfirmation(this.params.eventId);
  }
}
