import { Component, HostListener, Input, OnInit } from '@angular/core';
import { DateUtils, fluffyLoading } from 'ngx-fluffy-cow';
import { TimeSpan, TimeSpanUtils } from 'src/app/shift-common/utils/timespan.utils';
import { ShiftService } from '../services/shift.service';
import * as Parse from 'parse';
import { ShiftTable, ShiftTableCategory, ShiftTableService, TableShift } from '../services/shift-table.service';
import { MatDialog } from '@angular/material/dialog';
import { UserPickerDialogComponent } from '../user-picker-dialog/user-picker-dialog.component';

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
  selectedShift?: TableShift;
  editMode = false;

  selectedTimeSlot?: TableShift;
  userShiftDivElement?: HTMLDivElement;
  dragDropStartEdit = false;
  dragDropInitialRect?: DOMRect;

  constructor(public readonly shiftTableService: ShiftTableService,
    public dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.init();
  }

  @fluffyLoading()
  async init() {
    await this.shiftTableService.initByEventId(this.eventId ?? '');
    this.shiftTable = await this.shiftTableService.calculateShiftTable();
  }

  pickEditUser(): void {
    this.currentEditUser = undefined;
    this.selectShift(undefined);
    const dialog = this.dialog.open(UserPickerDialogComponent, {
      minWidth: '400px',
      data: this.shiftTableService.event
    });

    dialog.afterClosed().subscribe(selectedUser => {
      if (!selectedUser) {
        return;
      }
      this.currentEditUser = selectedUser;
    })
  }

  changeEditMode() {
    this.editMode = !this.editMode;
    this.selectShift(undefined);
  }

  async selectShift(tableShift?: TableShift) {
    this.shiftTable?.categories?.forEach(category => {
      category.shifts.forEach(shift => {
        shift.selected = false;
      });
    });
    if (!this.editMode) {
      this.selectedShift = undefined;
      return;
    }
    if (!tableShift) {
      return;
    }
    if (tableShift === this.selectedShift) {
      tableShift.selected = false;
    }
    this.selectedShift = tableShift;
    tableShift.selected = true;
    this.currentEditUser = tableShift.shift.get('user');
  }

  getTarget(event: MouseEvent) {
    if (event.target instanceof HTMLTableCellElement) {
      return event.target as HTMLTableCellElement;
    }
    return undefined;
  }

  @fluffyLoading()
  async onTableClick(category: Parse.Object<Parse.Attributes>, event: MouseEvent) {
    const target = this.getTarget(event);
    if (!this.editMode || !this.currentEditUser || !category || !target) {
      return;
    }

    let bounds = target.parentElement?.getBoundingClientRect();
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

    const shiftsInCurrentTimeSPanForUser = this.shiftTableService.userShifts?.filter(userShift =>
      userShift.get('user').id === this.currentEditUser?.id &&
      userShift.get('category')?.id === category.id &&
      TimeSpanUtils.isOverlapping(timeSpanOfSlot, {
        start: userShift.get('start'),
        end: userShift.get('end')
      })) ?? [];

    if (this.selectedShift) {
      // a shift is currently selected, do not edit anythin
      return;
    }

    if (shiftsInCurrentTimeSPanForUser.length > 0) {
      // in the timeslot a shift for the this.currentEditUser already exists

      // todo remove, only for testing
      await shiftsInCurrentTimeSPanForUser[0].destroy();
      this.shiftTableService.userShifts = this.shiftTableService.userShifts?.filter(x => x !== shiftsInCurrentTimeSPanForUser[0]);
      this.shiftTable = await this.shiftTableService.calculateShiftTable();
      return;
    }

    // create the shift, because it doesnt exists
    return await this.processCreateShiftClick(timeSpanOfSlot, category);
  }

  private async processCreateShiftClick(timeSpanOfSlot: TimeSpan, category: Parse.Object<Parse.Attributes>) {
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

  onShiftMouseDown(e: MouseEvent, timeslot: TableShift) {
    if (!this.editMode) {
      return;
    }
    this.selectedTimeSlot = timeslot;
    this.selectedTimeSlot.selected = true;
    this.currentEditUser = timeslot.shift.get('user');
    this.dragDropInitialRect = (e.target as HTMLDivElement).getBoundingClientRect();
    if (e.offsetX < 20) {
      this.dragDropStartEdit = true;
      this.userShiftDivElement = e.target as HTMLDivElement;
      return;
    }
    if (e.offsetX > timeslot.widthPx - 20) {
      this.dragDropStartEdit = false;
      this.userShiftDivElement = e.target as HTMLDivElement;
      return;
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.userShiftDivElement || !this.selectedTimeSlot || !this.dragDropInitialRect) {
      return;
    }
    const boundingClient = this.userShiftDivElement.getBoundingClientRect();

    const xEnd = boundingClient.x - e.x;
    const marginLeft = parseInt(this.userShiftDivElement.style.marginLeft.replace("px", ''));
    const diffTableLeftToScreenLeft = boundingClient.x - marginLeft;
    const xStart = e.x - diffTableLeftToScreenLeft;
    const newWidth = this.dragDropInitialRect.right - e.x;

    if (this.dragDropStartEdit) {
      //this.panel.style.marginLeft = xStartt + 'px';
      this.selectedTimeSlot.marginLeftPx = xStart;
      this.selectedTimeSlot.widthPx = newWidth;
    } else {
      //this.panel.style.width = -xEnd + 'px';
      this.selectedTimeSlot.widthPx = -xEnd;
    }
    return;
  }

  @HostListener('window:mouseup', ['$event'])
  async onMouseUp(e: MouseEvent) {
    if (this.selectedTimeSlot && this.userShiftDivElement) {
      // todo change start and end of shift
      const intervalShiftStartCount = Math.floor(this.selectedTimeSlot.marginLeftPx / this.shiftTableService.widthInterval);
      const intervalShiftLengthCount = this.dragDropStartEdit ?
        Math.ceil(this.selectedTimeSlot.widthPx / this.shiftTableService.widthInterval)
        : Math.round(this.selectedTimeSlot.widthPx / this.shiftTableService.widthInterval);

      const intervalShiftEndCount = intervalShiftStartCount + intervalShiftLengthCount;
      /// start = minutes where the timespan starts after the event starts
      // end = minutes when the timespan ends after the event starts
      const minutesRange = {
        start: intervalShiftStartCount * this.shiftTableService.minuteInterval,
        end: intervalShiftEndCount * this.shiftTableService.minuteInterval
      }
      const eventStart = this.shiftTableService.event?.get('start');
      const timeSpanOfSlot: TimeSpan = {
        start: DateUtils.addMinutes(eventStart, minutesRange.start) as Date,
        end: DateUtils.addMinutes(eventStart, minutesRange.end) as Date
      }
      this.selectedTimeSlot.shift.set('start', timeSpanOfSlot.start);
      this.selectedTimeSlot.shift.set('end', timeSpanOfSlot.end);
      await this.selectedTimeSlot.shift.save();
      this.shiftTableService.calculatePxForUserShift(this.selectedTimeSlot);
    }
    this.userShiftDivElement = undefined;
    this.dragDropInitialRect = undefined;
    this.selectedTimeSlot = undefined;
  }
}
