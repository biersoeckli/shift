import { Component } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { UserEventDetailParams } from './user-event-detail.params';
import * as Parse from 'parse';

@Component({
  selector: 'app-user-event-detail',
  templateUrl: './user-event-detail.component.html'
})
export class UserEventDetailComponent extends BaseComponent<UserEventDetailParams> {

  event?: Parse.Object<Parse.Attributes>;
  userShifts?: Parse.Object<Parse.Attributes>[];

  constructor(common: CommonService) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  async init() {
    if (!this.currentUser) {
      return;
    }
    this.event = await this.eventService.getEventById(this.params.eventId);
    this.userShifts = await this.getUserShiftForEvent(this.event, this.currentUser);    
  }


  async getUserShiftForEvent(event: Parse.Object<Parse.Attributes>, user: Parse.User<Parse.Attributes>) {
    const query = new Parse.Query(Parse.Object.extend('UserShift'));
    query.equalTo('event', event);
    query.equalTo('user', user);
    query.ascending('start');
    return await query.find();
  }

  @fluffyLoading()
  async editUserInfo() {
    await this.navigation.userProfile(window.location.pathname + '?eventId=' + this.params.eventId)
  }
}


