import { Component } from '@angular/core';
import { EventDetailParam } from 'src/app/event-planner/event-detail/event-detail.param';
import { BaseEditComponent } from 'src/app/shift-common/base-edit-component/base-edit-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import * as Parse from 'parse';
import { EventCategoryParam } from '../event-category.param';
import { fluffyCatch, fluffyLoading } from 'ngx-fluffy-cow';

@Component({
  selector: 'app-categories-edit',
  templateUrl: './categories-edit.component.html'
})
export class CategoriesEditComponent extends BaseEditComponent<EventCategoryParam> {
  
  event?: Parse.Object<Parse.Attributes>;

  constructor(common: CommonService) {
    super(common, 'EventCategory', 'categoryId');
    this.loadEvent();
    this.beforeSaveAction = unsavedItem => {
      unsavedItem.set('event', this.event);
      return unsavedItem;
    }
    this.afterSaveAction = savedItem => this.navigation.eventCategoryOverview(savedItem.get('event').id);
  }

  @fluffyLoading()
  @fluffyCatch()
  async loadEvent() {
    this.event = await this.eventService.getEventById(this.params.eventId);
  }
}