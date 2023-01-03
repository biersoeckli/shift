import { Component } from '@angular/core';
import { EventDetailParam } from 'src/app/event-planner/event-detail/event-detail.param';
import { BaseEditComponent } from 'src/app/shift-common/base-edit-component/base-edit-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { ShiftDetailParams } from './shift-detail.params';
import * as Parse from 'parse';
import { fluffyLoading } from 'ngx-fluffy-cow';

@Component({
  selector: 'app-shift-detail-edit',
  templateUrl: './shift-detail-edit.component.html'
})
export class ShiftDetailEditComponent extends BaseEditComponent<ShiftDetailParams> {
  event?: Parse.Object<Parse.Attributes>;

  constructor(common: CommonService) {
    super(common, 'Shift', 'shiftId');

    this.loadEvent();
    this.beforeSaveAction = unsavedItem => {
      unsavedItem.set('event', this.event);
      return unsavedItem;
    }
    this.afterSaveAction = savedItem => this.navigation.eventDetail(savedItem.get('event').id);
  }

  @fluffyLoading()
  async loadEvent() {
    const query = new Parse.Query(Parse.Object.extend('Event'));
    this.event = await query.get(this.params.eventId);
  }
}