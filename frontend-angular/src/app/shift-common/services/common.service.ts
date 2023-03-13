import { Injectable } from '@angular/core';
import { EventService } from './event.service';
import { NavigationService } from './navigation.service';
import * as Parse from 'parse';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  constructor(public readonly navigationService: NavigationService,
    public readonly eventService: EventService,
    public readonly alertService: AlertService) { }


  async getUserById(userId: string) {
    const userQuery = new Parse.Query(Parse.Object.extend('_User'))
    return await userQuery.get(userId);
  }
}
