import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private eventCache: Parse.Object<Parse.Attributes>[] = [];
  

  async getEventOrganizedByCurrentUser() {
    const query = new Parse.Query(Parse.Object.extend('Event'));
    query.limit(10000);
    let events =  await query.find();
    // todo filter by acl
    ///events = events.filter(event => event.getACL()?.getRoleWriteAccess(x => ))
    return events;
  }

  async getEventById(eventId: string, useCachedValue = false, includeContractConfig = false) {
    const cachedEvent = this.eventCache.find(eventCached => eventCached.id === eventId);
    if (useCachedValue && cachedEvent) {
      return cachedEvent;
    }
    const query = new Parse.Query(Parse.Object.extend('Event'));
    if (includeContractConfig) {
      query.include('volunteerContractConfig');
    }
    const event = await query.get(eventId);
    if (!cachedEvent) {
      this.eventCache.push(event);
    }
    return event;
  }

  public async getEventCategories(eventId: string) {
    const query = new Parse.Query(Parse.Object.extend('EventCategory'));
    query.equalTo('event', await this.getEventById(eventId, true));
    query.ascending('name');
    query.include('event');
    query.limit(10000);
    return await query.find();
  }

  async getUserEventsFromCurrentUser() {
    const query = new Parse.Query(Parse.Object.extend('UserEvent'));
    query.include('event');
    query.equalTo('user', Parse.User.current());
    return await query.find();
  }
}
