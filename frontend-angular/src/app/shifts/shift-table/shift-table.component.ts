import { Component, Input, OnInit } from '@angular/core';
import { DateUtils, fluffyLoading } from 'ngx-fluffy-cow';
import { TimeSpan, TimeSpanUtils } from 'src/app/shift-common/utils/timespan.utils';
import { ShiftService } from '../services/shift.service';
import * as Parse from 'parse';
import { ShiftTable, ShiftTableService } from '../services/shift-table.service';

@Component({
  selector: 'shift-table',
  templateUrl: './shift-table.component.html',
  styleUrls: ['./shift-table.component.scss']
})
export class ShiftTableComponent implements OnInit {

  @Input() eventId?: string;
  shiftTable?: ShiftTable;

  constructor(public readonly shiftTableService: ShiftTableService) {

  }

  ngOnInit(): void {
    this.init();
  }

  @fluffyLoading()
  async init() {
    await this.shiftTableService.initByEventId(this.eventId ?? '');
    this.shiftTable = await this.shiftTableService.calculateShiftTable();
  }

  onTableClick($event: MouseEvent) {
    // todo
  }
}
