import { Component } from '@angular/core';
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
    this.afterSaveAction = savedItem => this.navigation.shiftsOverview(savedItem.get('event').id);
  }

  @fluffyLoading()
  async loadAdditionalData() {
    this.event = await this.eventService.getEventById(this.params.eventId);
  }
}