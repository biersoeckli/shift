import { Injectable } from '@angular/core';
import { NavigationService } from './navigation.service';

@Injectable()
export class CommonService {
  constructor(public readonly navigationService: NavigationService) { }
}
