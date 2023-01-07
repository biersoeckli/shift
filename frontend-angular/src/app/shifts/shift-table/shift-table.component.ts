import { Component, Input, OnInit } from '@angular/core';
import { DateUtils, fluffyLoading } from 'ngx-fluffy-cow';
import { TimeSpan, TimeSpanUtils } from 'src/app/shift-common/utils/timespan.utils';
import { ShiftService } from '../services/shift.service';
import * as Parse from 'parse';
import { ShiftTable, ShiftTableCategory, ShiftTableService, TableTimeSlot } from '../services/shift-table.service';

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

  async onTableClick(event: MouseEvent) {
    let tableCellElement = this.getTableCellElement(event);
    if (!this.currentEditUser || !this.shiftTable || !tableCellElement?.id.startsWith(this.timeSlotIdPrefix)) {
      return;
    }
    const clickCoordinates = tableCellElement.id.replace(this.timeSlotIdPrefix, '').split(':');
    console.log('coordinates: ' + clickCoordinates.join(', '));

    const tableCategory: ShiftTableCategory = this.shiftTable.categories[+clickCoordinates[0]];
    const tableTimeSlot: TableTimeSlot = tableCategory.timeSlots[+clickCoordinates[1]];

   const userShiftFromTimeSlot = tableTimeSlot.userShifts.find(shift => shift.get('user').id === this.currentEditUser?.id);
    if (userShiftFromTimeSlot) {
      // remove shift from current timerange
      console.log('todo remove shift');
      await userShiftFromTimeSlot.destroy(); // todo remove
    } else {
      // add shift to time slot
      const shiftForTimeslot = await this.addUserToTimeSlot(this.currentEditUser, tableTimeSlot, tableCategory.category);
      tableTimeSlot.userShifts.push(shiftForTimeslot);
    }
  }

  private getTableCellElement(event: MouseEvent) {
    let tableCellElement = undefined;
    if (event.target instanceof HTMLTableCellElement) {
      tableCellElement = event.target;
    }
    if ((event.target as HTMLElement).parentElement instanceof HTMLTableCellElement) {
      tableCellElement = (event.target as HTMLElement).parentElement;
    }
    return tableCellElement;
  }

  async addUserToTimeSlot(currentEditUser: Parse.User<Parse.Attributes>, tableTimeSlot: TableTimeSlot, category: Parse.Object<Parse.Attributes>) {
    const userShifts = this.shiftTableService.userShifts?.filter(userShift =>
      userShift.get('user').id === currentEditUser.id && userShift.get('category')?.id === userShift) ?? [];


    const shiftNearStart = userShifts.find(userShift => tableTimeSlot.timeSpan.start.getTime() <= userShift.get('end').getTime());
    if (shiftNearStart) {
      // the new shift is nearby another shift
      shiftNearStart.set('end', tableTimeSlot.timeSpan.end);
      const shiftNearEnd = userShifts.find(userShift => userShift.get('start').getTime() <= tableTimeSlot.timeSpan.end.getTime());
      if (shiftNearEnd) {
        // shift will be added inbetween of two existing shifts -> expanding the shift near end with date from shift near start
        shiftNearEnd.set('start', shiftNearStart.get('start'));
        await shiftNearStart.destroy();
        return await shiftNearEnd.save();
      } else {
        return await shiftNearStart.save();
      }
    }

    const shiftNearEnd = userShifts.find(userShift => userShift.get('start').getTime() <= tableTimeSlot.timeSpan.end.getTime());
    if (shiftNearEnd) {
      // shift will be added inbetween of two existing shifts
      shiftNearEnd.set('start', tableTimeSlot.timeSpan.start);
      return await shiftNearEnd.save();
    }

    // create completely new
    const userShift = new (Parse.Object.extend("UserShift"));
    userShift.set('event', this.shiftTableService.event);
    userShift.set('user', this.currentEditUser);
    userShift.set('start', tableTimeSlot.timeSpan.start);
    userShift.set('end', tableTimeSlot.timeSpan.end);
    userShift.set('category', category);
    return await userShift.save();
  }
}
