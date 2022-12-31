import { Component } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { EventDetailParam } from '../event-detail/event-detail.param';
import * as Parse from 'parse';
import { BaseEditComponent } from 'src/app/shift-common/base-edit-component/base-edit-component.component';

@Component({
  selector: 'app-event-detail-edit',
  templateUrl: './event-detail-edit.component.html'
})
export class EventDetailEditComponent extends BaseEditComponent<EventDetailParam> {

  constructor(common: CommonService) {
    super(common, 'Event', 'eventId');
    this.afterSaveAction = savedItem => this.navigation.eventDetail(savedItem.id);
  }
}