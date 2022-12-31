import { Component } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import * as Parse from 'parse';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html'
})
export class EventsComponent extends BaseComponent<void> {
  events?: Parse.Object<Parse.Attributes>[];

  constructor(common: CommonService) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  async init() {
    const query = new Parse.Query(Parse.Object.extend("Event"));
    this.events = await query.find();
  }
}
