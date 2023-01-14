import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private eventCache: Parse.Object<Parse.Attributes>[] = [];
  
  async getEventById(eventId: string, useCachedValue = false) {
    const cachedEvent = this.eventCache.find(eventCached => eventCached.id === eventId);
    if (useCachedValue && cachedEvent) {
      return cachedEvent;
    }
    const query = new Parse.Query(Parse.Object.extend('Event'));
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
}
