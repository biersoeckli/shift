import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('contextMenu') contextMenuElement?: ElementRef;
  shiftTable?: ShiftTable;
  tableShiftIdPrefix = 'timeslot_';

  currentAddUser?: Parse.User<Parse.Attributes>;
  selectedShift?: TableShift;
  editMode = false;

  selectedTimeSlot?: TableShift;
  userShiftDivElement?: HTMLDivElement;
  dragDropStartEdit = false;
  dragDropInitialRect?: DOMRect;
  contextMenuSelectedTableShift?: TableShift;

  includeWishesInTable = false;

  constructor(public readonly shiftTableService: ShiftTableService,
    public dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.init();
  }

  @fluffyLoading()
  async init() {
    await this.shiftTableService.initByEventId(this.eventId ?? '');
    this.shiftTable = await this.shiftTableService.calculateShiftTable(this.includeWishesInTable);
  }

  pickAddUser(): void {
    if (this.currentAddUser) {
      this.currentAddUser = undefined;
      return;
    }
    const dialog = this.dialog.open(UserPickerDialogComponent, {
      minWidth: '400px',
      data: this.shiftTableService.event
    });

    dialog.afterClosed().subscribe(selectedUser => {
      if (!selectedUser) {
        return;
      }
      this.currentAddUser = selectedUser;
    })
  }

  changeEditMode() {
    this.editMode = !this.editMode;
  }

  getTarget(event: MouseEvent) {
    if (event.target instanceof HTMLTableCellElement) {
      return event.target as HTMLTableCellElement;
    }
    return undefined;
  }

  @fluffyLoading()
  async onTableClick(category: Parse.Object<Parse.Attributes>, event: MouseEvent) {
    if (!this.editMode || !this.currentAddUser || !category) {
      return;
    }
    const target = this.getTarget(event);
    if (!target) {
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

    const shiftsInCurrentTimeSpanForUser = this.shiftTableService.userShifts?.filter(userShift =>
      userShift.get('user').id === this.currentAddUser?.id &&
      userShift.get('category')?.id === category.id &&
      TimeSpanUtils.isOverlapping(timeSpanOfSlot, {
        start: userShift.get('start'),
        end: userShift.get('end')
      })) ?? [];

    if (this.selectedShift) {
      // a shift is currently selected, do not edit anythin
      return;
    }

    if (shiftsInCurrentTimeSpanForUser.length > 0) {
      // in the timeslot a shift for the this.currentEditUser already exists --> don't add a new one
      return;
    }

    // create the shift, because it doesnt exists
    const createdUserShift = await this.processCreateShiftClick(timeSpanOfSlot, category);
    this.currentAddUser = undefined;
    return createdUserShift;
  }

  private async processCreateShiftClick(timeSpanOfSlot: TimeSpan, category: Parse.Object<Parse.Attributes>) {
    const userShift = new (Parse.Object.extend("UserShift"));
    userShift.set('event', this.shiftTableService.event);
    userShift.set('user', this.currentAddUser);
    userShift.set('start', timeSpanOfSlot.start);
    userShift.set('end', timeSpanOfSlot.end);
    userShift.set('category', category);
    this.shiftTableService.userShifts?.push(userShift);
    this.shiftTable = await this.shiftTableService.calculateShiftTable(this.includeWishesInTable);
    return await userShift.save();
  }

  onShiftMouseDown(e: MouseEvent, timeslot: TableShift) {
    if (!this.editMode || this.currentAddUser) {
      return;
    }
    this.selectedTimeSlot = timeslot;
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
    // resize shifts
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
      this.selectedTimeSlot.selected = false;
      this.shiftTableService.calculatePxForUserShift(this.selectedTimeSlot);
    }
    this.userShiftDivElement = undefined;
    this.dragDropInitialRect = undefined;
    this.selectedTimeSlot = undefined;
  }

  /* context menu */
  @HostListener('window:mousedown', ['$event'])
  async onMouseDown(e: MouseEvent) {
    // reset context menu
    const divElementClick = e.target instanceof HTMLDivElement ? e.target as HTMLDivElement : undefined;
    if (this.contextMenuSelectedTableShift && this.contextMenuElement && !divElementClick?.classList?.contains('context-item')) {
      this.contextMenuSelectedTableShift = undefined;
      this.contextMenuElement.nativeElement.classList.remove("visible");
    }
  }

  async editContextMenuSelection() {
    if (!this.contextMenuElement || !this.contextMenuSelectedTableShift) {
      return;
    }

    this.contextMenuElement.nativeElement.classList.remove("visible");
  }

  async deleteContextMenuSelection() {
    console.log(this.contextMenuSelectedTableShift);
    
    if (!this.contextMenuElement || !this.contextMenuSelectedTableShift) {
      return;
    }
    await this.contextMenuSelectedTableShift.shift.destroy();
    this.shiftTableService.userShifts = this.shiftTableService.userShifts?.filter(x => x !== this.contextMenuSelectedTableShift?.shift);
    this.shiftTable = await this.shiftTableService.calculateShiftTable(this.includeWishesInTable);
    this.contextMenuElement.nativeElement.classList.remove("visible");
  }

  onContextMenu(e: MouseEvent) {
    e.preventDefault();
    const target = e.target instanceof HTMLDivElement ? e.target as HTMLDivElement : undefined;
    if (!this.editMode || !this.contextMenuElement || !this.shiftTable || !target || !target.id.startsWith(this.tableShiftIdPrefix)) {
      return;
    }
    const indexIds = target.id.replace(this.tableShiftIdPrefix, '').split(':');
    if (indexIds.length !== 2) {
      return;
    }
    const tableCategoryIndex = +indexIds[0];
    const tableShiftIndex = +indexIds[1];
    this.contextMenuSelectedTableShift = this.shiftTable.categories[tableCategoryIndex].shifts[tableShiftIndex];

    const { clientX: mouseX, clientY: mouseY } = e;

    this.contextMenuElement.nativeElement.style.top = `${mouseY}px`;
    this.contextMenuElement.nativeElement.style.left = `${mouseX}px`;

    this.contextMenuElement.nativeElement.classList.add("visible");
  }

  async toggleIncludeWishes() {
    this.includeWishesInTable = !this.includeWishesInTable;
    this.shiftTable = await this.shiftTableService.calculateShiftTable(this.includeWishesInTable);
  }
}
