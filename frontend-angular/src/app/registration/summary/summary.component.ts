import { Component } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { ShiftService } from 'src/app/shifts/services/shift.service';
import { RegistrationParams } from '../registration.params';
import * as Parse from 'parse';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html'
})
export class SummaryComponent extends BaseComponent<RegistrationParams> {

  event?: Parse.Object<Parse.Attributes>;
  userEventCategories?: Parse.Object<Parse.Attributes>[];
  userShift?: Parse.Object<Parse.Attributes>[];
  userEvent?: Parse.Object<Parse.Attributes>;
  currentUser = Parse.User.current();


  constructor(common: CommonService,
    private readonly shiftService: ShiftService) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  async init() {
    this.event = await this.shiftService.getEvent(this.params.eventId);
    this.userEventCategories = await this.fetchUserCategories();
    this.userShift = await this.shiftService.getWishBookingsForEventAndUser(this.event);

    let userEvent = await this.fetchExistingUserEvent();
    if (!userEvent) {
      userEvent = new (Parse.Object.extend("UserEvent")) as Parse.Object<Parse.Attributes>;
      userEvent.set('event', this.event);
      userEvent.set('user', Parse.User.current());
    }
    this.userEvent = userEvent;
  }

  async fetchExistingUserEvent() {
    const query = new Parse.Query(Parse.Object.extend('UserEvent'));
    query.equalTo('event', this.event);
    query.equalTo('user', Parse.User.current());
    return await query.first();
  }

  async fetchUserCategories() {
    const query = new Parse.Query(Parse.Object.extend('UserEventCategory'));
    query.include('category');
    query.equalTo('event', this.event);
    query.equalTo('user', Parse.User.current());
    return await query.find();
  }

  editCategories() {
    this.navigation.registrationCategoryChooser(this.params.eventId, window.location.pathname + '?eventId=' + this.params.eventId)
  }

  editUserInfo() {
    this.navigation.userProfile(window.location.pathname + '?eventId=' + this.params.eventId)
  }

  @fluffyLoading()
  async save() {
    await this.userEvent?.save();
    await this.navigation.registrationConfirmation(this.params.eventId);
  }
}
