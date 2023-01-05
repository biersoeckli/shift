import { Component, Input } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { ShiftService } from '../services/shift.service';


interface ShiftTable {
  shift: Parse.Object<Parse.Attributes>;
  users?: ShiftTableUser[];
}

interface ShiftTableUser {
  user: Parse.Object<Parse.Attributes>;
  wishes?: Parse.Object<Parse.Attributes>[];
  bookings: Parse.Object<Parse.Attributes>[];
}

@Component({
  selector: 'shift-table',
  templateUrl: './shift-table.component.html',
  styleUrls: ['./shift-table.component.scss']
})
export class ShiftTableComponent {

  @Input() eventId?: string;
  shiftTable?: ShiftTable[];

  constructor(public readonly shiftService: ShiftService) {
    this.init();
  }

  @fluffyLoading()
  async init() {
    await this.shiftService.initByEventId(this.eventId ?? '');
  }
}
