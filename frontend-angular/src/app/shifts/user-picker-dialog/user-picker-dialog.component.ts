import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fluffyLoading } from 'ngx-fluffy-cow';
import * as Parse from 'parse';

interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-user-picker-dialog',
  templateUrl: './user-picker-dialog.component.html'
})
export class UserPickerDialogComponent {

  newUser = {} as NewUser;

  userEvents?: Parse.Object<Parse.Attributes>[];
  filteredUserEvents?: Parse.Object<Parse.Attributes>[];
  searchTerm = '';
  searchMode = true;
  errorString?: string;

  constructor(public dialogRef: MatDialogRef<UserPickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public event: Parse.Object<Parse.Attributes>) {
    if (!event) {
      return;
    }
    this.init();
  }

  async init() {
    const query = new Parse.Query(Parse.Object.extend('UserEvent'));
    query.equalTo('event', this.event);
    query.include('user');
    query.limit(10000);
    this.userEvents = await query.find();
    this.filter();
  }

  filter() {
    if (!this.searchTerm) {
      this.filteredUserEvents = this.userEvents;
    }
    this.filteredUserEvents = this.userEvents?.filter(userEvent =>
      `${userEvent.get('user').get('firstName')} ${userEvent.get('user').get('lastName')}`.toLocaleLowerCase()
        .includes(this.searchTerm.toLocaleLowerCase())) ?? [];
  }

  selectUser(user: Parse.User<Parse.Attributes>) {
    this.dialogRef.close(user);
  }

  @fluffyLoading()
  async createAndSaveUser() {
    try {
      const userId = await Parse.Cloud.run('getOrCreateUserForPhoneNumber', this.newUser);
      const userEventId = await Parse.Cloud.run('addUserByIdToEvent', { userId, eventId: this.event.id });

      const query = new Parse.Query(Parse.Object.extend('UserEvent'));
      query.include('user');
      const createdUserEvent = await query.get(userEventId);
      this.selectUser(createdUserEvent.get('user'));
    } catch (ex) {
      if (ex instanceof Error) {
        this.errorString = ex.message;
      }
      throw ex;
    }
  }
}
