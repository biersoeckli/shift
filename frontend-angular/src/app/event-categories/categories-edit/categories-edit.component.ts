import { Component } from '@angular/core';
import { EventDetailParam } from 'src/app/event-planner/event-detail/event-detail.param';
import { BaseEditComponent } from 'src/app/shift-common/base-edit-component/base-edit-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import * as Parse from 'parse';
import { EventCategoryParam } from '../event-category.param';
import { fluffyCatch, fluffyLoading } from 'ngx-fluffy-cow';
import { MatDialog } from '@angular/material/dialog';
import { UserPickerDialogComponent } from 'src/app/shifts/user-picker-dialog/user-picker-dialog.component';

@Component({
  selector: 'app-categories-edit',
  templateUrl: './categories-edit.component.html'
})
export class CategoriesEditComponent extends BaseEditComponent<EventCategoryParam> {

  event?: Parse.Object<Parse.Attributes>;

  constructor(private readonly dialog: MatDialog, common: CommonService) {
    super(common, 'EventCategory', 'categoryId');
    this.loadEvent();
    this.beforeQueryAction = query => {
      query.include('responsibleUser');
      return query;
    }
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

  pickResponsibleUser(): void {
    if (this.item?.get('responsibleUser')) {
      this.item?.set('responsibleUser', null);
      return;
    }
    const dialog = this.dialog.open(UserPickerDialogComponent, {
      minWidth: '400px',
      width: '50%',
      data: this.event
    });

    dialog.afterClosed().subscribe(selectedUser => {
      if (!selectedUser) {
        return;
      }
      this.item?.set('responsibleUser', selectedUser);
    });
  }
}