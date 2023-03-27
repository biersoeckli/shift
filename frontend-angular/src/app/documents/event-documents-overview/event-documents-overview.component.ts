import { Component, OnInit } from '@angular/core';
import { fluffyCatch, fluffyLoading } from 'ngx-fluffy-cow';
import { EventDetailParam } from 'src/app/event-planner/event-detail/event-detail.param';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import * as Parse from 'parse';

interface UserDocuments {
  user: Parse.User;
  documents: Parse.Object[];
}

@Component({
  selector: 'app-event-documents-overview',
  templateUrl: './event-documents-overview.component.html'
})
export class EventDocumentsOverviewComponent extends BaseComponent<EventDetailParam> {

  event?: Parse.Object<Parse.Attributes>;
  users?: any[];
  userDocs?: UserDocuments[];


  constructor(common: CommonService) {
    super(common);
    this.init();
  }


  @fluffyLoading()
  async init() {
    this.event = await this.eventService.getEventById(this.params.eventId ?? '', true);
    const users = await this.eventService.getUserEvents(this.params.eventId ?? '');
    this.users = users.map(x => x.get('user'));

    const query = new Parse.Query(Parse.Object.extend('EventDocument'));
    query.equalTo('event', this.event);
    query.include('user');
    query.limit(10000);
    const documents = await query.find();

    this.userDocs = this.users.map(user => {
      const userDocs = documents.filter(doc => doc.get('user').id === user.id);
      return {
        user,
        documents: userDocs
      } as UserDocuments;
    })
  }


  openDocument(doc: Parse.Object<Parse.Attributes>) {
    window.open((doc.get('file') as Parse.File).url());
  }

  @fluffyCatch()
  async deleteDocument(doc: Parse.Object<Parse.Attributes>) {
    if (!confirm(`Willst du das Dokument ${doc.get('name')} wirklich löschen?`)) {
      return;
    }
    await this.loady(async () => {
      await doc.destroy();
      await this.init();
    })
  }
}
