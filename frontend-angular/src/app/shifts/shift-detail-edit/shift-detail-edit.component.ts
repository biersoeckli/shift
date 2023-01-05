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
  categories?: Parse.Object<Parse.Attributes>[];

  constructor(common: CommonService) {
    super(common, 'Shift', 'shiftId');

    this.loadAdditionalData();
    this.beforeSaveAction = unsavedItem => {
      unsavedItem.set('event', this.event);
      return unsavedItem;
    }
    this.afterSaveAction = savedItem => this.navigation.eventDetail(savedItem.get('event').id);
  }

  @fluffyLoading()
  async loadAdditionalData() {
    const query = new Parse.Query(Parse.Object.extend('Event'));
    this.event = await query.get(this.params.eventId);

    const query2 = new Parse.Query(Parse.Object.extend('EventCategory'));
    this.categories = await query2.find();
  }


  categoryCompareFn = this._categoryCompareFn.bind(this);
  _categoryCompareFn(catA: Parse.Object<Parse.Attributes>, catB: Parse.Object<Parse.Attributes>) {
    return catA?.id === catB?.id;
  }
}