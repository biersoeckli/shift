import { Component } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { initialize } from 'parse';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { UserEventDetailParams } from './user-event-detail.params';

@Component({
  selector: 'app-user-event-detail',
  templateUrl: './user-event-detail.component.html'
})
export class UserEventDetailComponent extends BaseComponent<UserEventDetailParams> {

  event?: Parse.Object<Parse.Attributes>;

  constructor(common: CommonService) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  async init() {
    this.event = await this.eventService.getEventById(this.params.eventId);
  }
}


