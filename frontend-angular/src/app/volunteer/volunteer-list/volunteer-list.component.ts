import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as Parse from 'parse';

@Component({
  selector: 'shift-volunteer-list',
  templateUrl: './volunteer-list.component.html'
})
export class VolunteerListComponent implements OnInit {

  @Input() eventId?: string;
  @Output() userEventSelected = new EventEmitter<Parse.Object<Parse.Attributes>>();
  userEvents?: Parse.Object<Parse.Attributes>[];
  filteredUserEvents?: Parse.Object<Parse.Attributes>[];
  searchTerm = '';

  constructor() {
  }

  async ngOnInit() {
    const event = await this.getEvent();
    await this.getUserEvents(event);
    this.filter();
  }

  private async getUserEvents(event: Parse.Object<Parse.Attributes>) {
    const query = new Parse.Query(Parse.Object.extend('UserEvent'));
    query.equalTo('event', event);
    query.include('user');
    query.limit(10000);
    this.userEvents = await query.find();
  }

  private async getEvent() {
    console.log(this.eventId);

    const query = new Parse.Query(Parse.Object.extend('Event'));
    return await query.get(this.eventId ?? '');
  }

  filter() {
    if (!this.searchTerm) {
      this.filteredUserEvents = this.userEvents;
    }
    this.filteredUserEvents = this.userEvents?.filter(userEvent =>
      `${userEvent.get('user').get('firstName')} ${userEvent.get('user').get('lastName')}`.toLocaleLowerCase()
        .includes(this.searchTerm.toLocaleLowerCase())) ?? [];
  }

  selectUser(userEvent: Parse.Object<Parse.Attributes>) {
    this.userEventSelected.next(userEvent);
  }
}
