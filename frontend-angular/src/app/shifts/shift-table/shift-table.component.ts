import { Component, Input, OnInit } from '@angular/core';
import { DateUtils, fluffyLoading } from 'ngx-fluffy-cow';
import { TimeSpan, TimeSpanUtils } from 'src/app/shift-common/utils/timespan.utils';
import { ShiftService } from '../services/shift.service';
import * as Parse from 'parse';
import { ShiftTable, ShiftTableCategory, ShiftTableService, TableShift } from '../services/shift-table.service';

@Component({
  selector: 'shift-table',
  templateUrl: './shift-table.component.html',
  styleUrls: ['./shift-table.component.scss']
})
export class ShiftTableComponent implements OnInit {

  @Input() eventId?: string;
  shiftTable?: ShiftTable;
  timeSlotIdPrefix = 'timeslot_';

  currentEditUser?: Parse.User<Parse.Attributes>;

  constructor(public readonly shiftTableService: ShiftTableService) {
    this.currentEditUser = Parse.User.current(); // todo remove
  }

  ngOnInit(): void {
    this.init();
  }

  @fluffyLoading()
  async init() {
    await this.shiftTableService.initByEventId(this.eventId ?? '');
    this.shiftTable = await this.shiftTableService.calculateShiftTable();
  }

  @fluffyLoading()
  async onTableClick(category: Parse.Object<Parse.Attributes>, event: MouseEvent) {
    if (!this.currentEditUser || !category) {
      return;
    }
    let bounds = (event.target as HTMLElement)?.parentElement?.getBoundingClientRect();
    if (!bounds) {
      return;
    }
    let relativeXCoord = event.clientX - bounds.left;
    const intervalCount = Math.floor(relativeXCoord / this.shiftTableService.widthInterval);

    /// start = minutes where the timespan starts after the event starts
    // end = minutes when the timespan ends after the event starts
    const minutesRange = {
      start: (intervalCount - 1) * this.shiftTableService.minuteInterval,
      end: (intervalCount) * this.shiftTableService.minuteInterval
    }

    const eventStart = this.shiftTableService.event?.get('start');
    const timeSpanOfSlot: TimeSpan = {
      start: DateUtils.addMinutes(eventStart, minutesRange.start) as Date,
      end: DateUtils.addMinutes(eventStart, minutesRange.end) as Date
    }
    console.log(timeSpanOfSlot);

    const shiftsInCurrentTimeSPanForUser = this.shiftTableService.userShifts?.filter(userShift => 
      userShift.get('user').id === this.currentEditUser?.id &&
      userShift.get('category')?.id === category.id &&
      TimeSpanUtils.isOverlapping(timeSpanOfSlot, {
        start: userShift.get('start'),
        end: userShift.get('end')
      })) ?? [];

    if (shiftsInCurrentTimeSPanForUser.length > 0) {
      // in the timeslot a shift for the this.currentEditUser already exists

      // todo remove, only for testing
      await shiftsInCurrentTimeSPanForUser[0].destroy();
      this.shiftTableService.userShifts = this.shiftTableService.userShifts?.filter(x => x !== shiftsInCurrentTimeSPanForUser[0]);
      this.shiftTable = await this.shiftTableService.calculateShiftTable();
      return;
    }

    // create the shift, because it doesnt exists
    const userShift = new (Parse.Object.extend("UserShift"));
    userShift.set('event', this.shiftTableService.event);
    userShift.set('user', this.currentEditUser);
    userShift.set('start', timeSpanOfSlot.start);
    userShift.set('end', timeSpanOfSlot.end);
    userShift.set('category', category);
    this.shiftTableService.userShifts?.push(userShift);
    this.shiftTable = await this.shiftTableService.calculateShiftTable();
    return await userShift.save();
  }
}
