import { Component } from '@angular/core';
import { EventDetailParam } from 'src/app/event-planner/event-detail/event-detail.param';
import { BaseEditComponent } from 'src/app/shift-common/base-edit-component/base-edit-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { ShiftDetailParams } from './shift-detail.params';
import * as Parse from 'parse';

@Component({
  selector: 'app-shift-detail-edit',
  templateUrl: './shift-detail-edit.component.html'
})
export class ShiftDetailEditComponent extends BaseEditComponent<ShiftDetailParams> {

  constructor(common: CommonService) {
    super(common, 'Shift', 'shiftId');

    this.beforeSaveAction = async unsavedItem => {
      const query = new Parse.Query(Parse.Object.extend('Event'));
      const event = await query.get(this.params.eventId);
      unsavedItem.set('event', event);
      return unsavedItem;
    }

    this.afterSaveAction = savedItem => this.navigation.eventDetail(savedItem.get('event').id);
  }
}