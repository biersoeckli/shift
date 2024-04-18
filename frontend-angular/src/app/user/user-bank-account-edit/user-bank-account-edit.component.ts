import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fluffyLoading, fluffyCatch } from 'ngx-fluffy-cow';
import { EventCategoryParam } from 'src/app/event-categories/event-category.param';
import { BaseEditComponent } from 'src/app/shift-common/base-edit-component/base-edit-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { UserPickerDialogComponent } from 'src/app/shifts/user-picker-dialog/user-picker-dialog.component';

@Component({
  selector: 'app-user-bank-account-edit',
  templateUrl: './user-bank-account-edit.component.html'
})
export class UserBankAccountEditComponent extends BaseEditComponent<{ userId: string, eventId: string; }> {

  event?: Parse.Object<Parse.Attributes>;

  constructor(common: CommonService) {
    super(common, '_User', 'userId', false);
    this.afterSaveAction = () => this.navigation.userEventOverview(this.params.eventId);
  }
}
