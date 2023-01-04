import { Injectable } from "@angular/core";
import * as Parse from 'parse';

export interface ShiftWithBookings {
    shift: Parse.Object<Parse.Attributes>;
    bookings: Parse.Object<Parse.Attributes>[];
}

export interface ShiftWithWishBooking {
    shift: Parse.Object<Parse.Attributes>;
    booking?: Parse.Object<Parse.Attributes>;
}


@Injectable()
export class ShiftService {

    public async getShiftsWithBookings(eventId: string) {
        if (!eventId) {
            return;
        }
        const event = await this.getEvent(eventId);
        if (!event) {
            return;
        }
        const [userShifts, allShifts] = await Promise.all([this.getShiftsBookingsForEvent(event), this.getShiftsForEvent(event)]);
        return allShifts.map(shift => {
            return {
                shift,
                bookings: userShifts.filter(userShift => userShift.get('shift').id === shift.id)
            } as ShiftWithBookings;
        })
    }


    public async getShiftsWithWishBookings(eventId: string) {
        if (!eventId) {
            return;
        }
        const event = await this.getEvent(eventId);
        if (!event) {
            return;
        }
        const [userShifts, allShifts] = await Promise.all([this.getWishBookingsForEvent(event), this.getShiftsForEvent(event)]);
        return allShifts.map(shift => {
            return {
                shift,
                booking: userShifts.find(userShift => userShift.get('shift').id === shift.id)
            } as ShiftWithWishBooking;
        })
    }

    public async getEvent(eventId: string) {
        const query = new Parse.Query(Parse.Object.extend('Event'));
        return await query.get(eventId);
    }

    private async getShiftsForEvent(event?: Parse.Object<Parse.Attributes>) {
        const query = new Parse.Query(Parse.Object.extend('Shift'));
        query.equalTo('event', event);
        query.include('event');
        return await query.find();
    }


    private async getWishBookingsForEvent(event: Parse.Object<Parse.Attributes>) {
        const query = new Parse.Query(Parse.Object.extend('UserShiftWish'));
        query.equalTo('event', event);
        query.include('event');
        query.include('user');
        query.include('shift');
        return await query.find();
    }

    private async getShiftsBookingsForEvent(event: Parse.Object<Parse.Attributes>) {
        const query = new Parse.Query(Parse.Object.extend('UserShift'));
        query.equalTo('event', event);
        query.include('event');
        query.include('user');
        query.include('shift');
        return await query.find();
    }
}