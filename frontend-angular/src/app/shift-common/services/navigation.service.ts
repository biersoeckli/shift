import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthParams } from 'src/app/auth/auth.params';
import { EventDetailParam } from 'src/app/event-planner/event-detail/event-detail.param';
import { ShiftDetailParams } from 'src/app/shifts/shift-detail-edit/shift-detail.params';
import { UserProfileParams } from 'src/app/user/user-profile/user-profile.params';

@Injectable()
export class NavigationService {

  constructor(public readonly router: Router) { }

  authenticate(returnUrl: string) {
    this.router.navigate(['auth'], {
      queryParams: new AuthParams(returnUrl)
    });
  }

  registrationUserDetails(eventId: string) {
    this.router.navigate(['user', 'profile'], {
      queryParams: new UserProfileParams('/register/shift-chooser?eventId=' + eventId)
    });
  }

  eventOverview() {
    this.router.navigate(['events']);
  }

  eventDetail(eventId: string) {
    this.router.navigate(['events', 'detail'], {
      queryParams: new EventDetailParam(eventId)
    });
  }

  eventDetailEdit(eventId?: string) {
    if (eventId) {
      this.router.navigate(['events', 'detail', 'edit'], {
        queryParams: new EventDetailParam(eventId)
      });
    } else {
      this.router.navigate(['events', 'detail', 'edit']);
    }
  }

  shiftDetail(shiftId: string) {
    this.router.navigate(['shifts', 'detail'], {
      queryParams: new ShiftDetailParams(shiftId)
    });
  }

  shiftDetailEdit(eventId: string, shiftId?: string) {
    this.router.navigate(['shifts', 'detail', 'edit'], {
      queryParams: new ShiftDetailParams(eventId, shiftId)
    });
  }
}
