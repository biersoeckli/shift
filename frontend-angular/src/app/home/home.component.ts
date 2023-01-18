import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { ShiftWithBookings, ShiftService } from 'src/app/shifts/services/shift.service';
import { ShiftDetailParams } from 'src/app/shifts/shift-detail-edit/shift-detail.params';
import * as Parse from 'parse';
import { fluffyLoading, ParseUserUtils } from 'ngx-fluffy-cow';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent extends BaseComponent<ShiftDetailParams>{

  userEvents?: Parse.Object<Parse.Attributes>[];
  events?: Parse.Object<Parse.Attributes>[];
  isOrganizer = false;

  constructor(common: CommonService) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  async init() {
    [this.userEvents, this.events, this.isOrganizer] = await Promise.all([
      this.eventService.getUserEventsFromCurrentUser(),
      this.eventService.getEventOrganizedByCurrentUser(),
      ParseUserUtils.isLoggedInUserInRole('event_organizer')
    ]);
  }
}
