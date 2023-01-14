import { Component } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import * as Parse from 'parse';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { EventCategoryParam } from '../event-category.param';

@Component({
  selector: 'app-categories-overview',
  templateUrl: './categories-overview.component.html'
})
export class CategoriesOverviewComponent extends BaseComponent<EventCategoryParam> {
  categories?: Parse.Object<Parse.Attributes>[];
  event?: Parse.Object<Parse.Attributes>;

  constructor(common: CommonService) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  private async init() {
    this.event = await this.eventService.getEventById(this.params.eventId);
    this.categories = await this.eventService.getEventCategories(this.params.eventId);
  }
}
