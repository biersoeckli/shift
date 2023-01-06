import { Component, Input, OnInit } from '@angular/core';
import { DateUtils, fluffyLoading } from 'ngx-fluffy-cow';
import { TimeSpan, TimeSpanUtils } from 'src/app/shift-common/utils/timespan.utils';
import { ShiftService } from '../services/shift.service';
import * as Parse from 'parse';

interface ShiftTable {
  category: Parse.Object<Parse.Attributes>;
  timeSlots: TimeSlot[];
}

interface TimeSlot {
  timeSpan: TimeSpan;
  userShifts: Parse.Object<Parse.Attributes>[];
  availableUsers?: Parse.Object<Parse.Attributes>[];
}

@Component({
  selector: 'shift-table',
  templateUrl: './shift-table.component.html',
  styleUrls: ['./shift-table.component.scss']
})
export class ShiftTableComponent implements OnInit {

  @Input() eventId?: string;
  shiftTable?: ShiftTable[];

  constructor(public readonly shiftService: ShiftService) {

  }
  ngOnInit(): void {
    this.init();
  }

  @fluffyLoading()
  async init() {
    await this.shiftService.initByEventId(this.eventId ?? '');
    const categories = await this.fetchAllCategories();
    this.shiftTable = await new Promise(resolve => resolve(
      categories.map(category => {
        return {
          category,
          timeSlots: this.buildTimeSlots(category)
        } as ShiftTable;
      })
    ));

    console.log(this.shiftTable);
  }

  buildTimeSlots(category: Parse.Object<Parse.Attributes>): TimeSlot[] {
    if (!this.shiftService.event) {
      return [];
    }
    const result: TimeSlot[] = [];

    const minuteInterval = 30;
    const startDate = this.shiftService.event.get('start') as Date;
    const endDate = this.shiftService.event.get('end') as Date;
    let counterDate = new Date(startDate);

    while (counterDate.getTime() < endDate.getTime()) {
      // evaluating end of current timespan range
      const nextDate = DateUtils.addMinutes(counterDate, minuteInterval) as Date;
      const timeSpan = {
        start: counterDate,
        end: nextDate
      } as TimeSpan;

      result.push({
        timeSpan,
        userShifts: this.evaluateUserShiftForTimeSpan(timeSpan)
      } as TimeSlot);
      counterDate = nextDate;
    }

    return result;
  }

  evaluateUserShiftForTimeSpan(timeSpan: TimeSpan): Parse.Object<Parse.Attributes>[] {
    return this.shiftService.userShifts?.filter(userShift =>
      TimeSpanUtils.isOverlapping(timeSpan, {
        start: userShift.get('start'),
        end: userShift.get('end')
      })) ?? [];
  }

  async fetchAllCategories() {
    const query = new Parse.Query(Parse.Object.extend('EventCategory'));
    query.equalTo('event', this.shiftService.event);
    query.ascending('name');
    return await query.find();
  }
}
