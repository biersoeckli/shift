import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import * as Parse from 'parse';
import { UserPickerDialogComponent } from 'src/app/shifts/user-picker-dialog/user-picker-dialog.component';
import { EventDocumentUploadOverlayComponent, EventDocumentUploadOverlayInput } from '../event-document-upload-overlay/event-document-upload-overlay.component';
import { fluffyLoading } from 'ngx-fluffy-cow';

@Component({
  selector: 'shift-event-document-container',
  templateUrl: './event-document-container.component.html'
})
export class EventDocumentContainerComponent extends BaseComponent<void> {

  @Input() eventId?: string;
  @Input() userId?: string;
  documents?: Parse.Object<Parse.Attributes>[];
  user?: Parse.Object<Parse.Attributes>;
  event?: Parse.Object<Parse.Attributes>;

  constructor(private readonly dialog: MatDialog,
    common: CommonService) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  async init() {
    if (!this.eventId) {
      return;
    }
    const event = await this.eventService.getEventById(this.eventId, true);
    if (!this.userId) {
      this.user = Parse.User.current();
    } else {
      this.user = await this.getUserById(this.userId);
    }

    const query = new Parse.Query(Parse.Object.extend('EventDocument'));
    query.equalTo('event', this.event);
    query.equalTo('user', this.user);
    query.include('user');
    query.limit(10000);
    this.documents = await query.find();
  }

  addDocuments() {
    const dialog = this.dialog.open(EventDocumentUploadOverlayComponent, {
      minWidth: '400px',
      width: '50%',
      data: {
        user: this.user,
        event: this.event
      } as EventDocumentUploadOverlayInput
    });

    dialog.afterClosed().subscribe(() => this.init());
  }

}
