import { Component, EventEmitter, Input, Output } from '@angular/core';
import { fluffyLoading } from 'ngx-fluffy-cow';
import * as Parse from 'parse';

interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'shift-volunteer-edit-form',
  templateUrl: './volunteer-edit-form.component.html'
})
export class VolunteerEditFormComponent {

  @Input() eventId?: string;
  @Output() createdUserEvent = new EventEmitter<Parse.Object<Parse.Attributes>>();
  newUser = {} as NewUser;

  errorString?: string;

  @fluffyLoading()
  async createAndSaveUser() {
    try {
      const userId = await Parse.Cloud.run('getOrCreateUserForPhoneNumber', this.newUser);
      const userEventId = await Parse.Cloud.run('addUserByIdToEvent', { userId, eventId: this.eventId });

      const query = new Parse.Query(Parse.Object.extend('UserEvent'));
      query.include('user');
      const createdUserEvent = await query.get(userEventId);
      this.createdUserEvent.next(createdUserEvent);
    } catch (ex) {
      if (ex instanceof Error) {
        this.errorString = ex.message;
      }
      throw ex;
    }
  }
}
