import { Injectable } from '@angular/core';
import { EventService } from './event.service';
import { NavigationService } from './navigation.service';

@Injectable()
export class CommonService {
  constructor(public readonly navigationService: NavigationService,
    public readonly eventService: EventService) { }
}
