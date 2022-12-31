import { Component } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import * as Parse from 'parse';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { EventDetailParam } from './event-detail.param';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html'
})
export class EventDetailComponent extends BaseComponent<EventDetailParam> {

  event?: Parse.Object<Parse.Attributes>;

  constructor(common: CommonService) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  async init() {
    const query = new Parse.Query(Parse.Object.extend("Event"));
    this.event = await query.get(this.params.eventId ?? '');
  }
}
