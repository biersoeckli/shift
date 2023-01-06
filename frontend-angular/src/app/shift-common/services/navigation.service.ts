import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthParams } from 'src/app/auth/auth.params';
import { EventCategoryParam } from 'src/app/event-categories/event-category.param';
import { EventDetailParam } from 'src/app/event-planner/event-detail/event-detail.param';
import { RegistrationParams } from 'src/app/registration/registration.params';
import { ShiftDetailParams } from 'src/app/shifts/shift-detail-edit/shift-detail.params';
import { UserProfileParams } from 'src/app/user/user-profile/user-profile.params';

@Injectable()
export class NavigationService {

  constructor(public readonly router: Router) { }

  async authenticate(returnUrl: string) {
    await this.router.navigate(['auth'], {
      queryParams: new AuthParams(returnUrl)
    });
  }

  async registrationUserDetails(eventId: string) {
    await this.router.navigate(['user', 'profile'], {
      queryParams: new UserProfileParams('/register/category-chooser?eventId=' + eventId)
    });
  }

  async registrationShiftChooser(eventId: string, returnUrl?: string) {
    await this.router.navigate(['register', 'shift-chooser'], {
      queryParams: new RegistrationParams(eventId, returnUrl)
    });
  }

  async registrationCategoryChooser(eventId: string, returnUrl?: string) {
    await this.router.navigate(['register', 'category-chooser'], {
      queryParams: new RegistrationParams(eventId, returnUrl)
    });
  }

  async registrationSummary(eventId: string) {
    await this.router.navigate(['register', 'summary'], {
      queryParams: new RegistrationParams(eventId)
    });
  }

  async registrationConfirmation(eventId: string) {
    await this.router.navigate(['register', 'confirmation'], {
      queryParams: new RegistrationParams(eventId)
    });
  }

  async eventOverview() {
    await this.router.navigate(['events']);
  }

  async eventDetail(eventId: string) {
    await this.router.navigate(['events', 'detail'], {
      queryParams: new EventDetailParam(eventId)
    });
  }

  async eventDetailEdit(eventId?: string) {
    if (eventId) {
      await this.router.navigate(['events', 'detail', 'edit'], {
        queryParams: new EventDetailParam(eventId)
      });
    } else {
      await this.router.navigate(['events', 'detail', 'edit']);
    }
  }

  async shiftDetail(shiftId: string) {
    await this.router.navigate(['shifts', 'detail'], {
      queryParams: new ShiftDetailParams(shiftId)
    });
  }

  async shiftDetailEdit(eventId: string, shiftId?: string) {
    await this.router.navigate(['shifts', 'detail', 'edit'], {
      queryParams: new ShiftDetailParams(eventId, shiftId)
    });
  }

  async eventCategoryOverview(eventId: string) {
    await this.router.navigate(['events', 'categories'], {
      queryParams: new EventCategoryParam(eventId)
    });
  }

  async eventCategoryEdit(eventId: string, categoryId?: string) {
    await this.router.navigate(['events', 'categories', 'edit'], {
      queryParams: new EventCategoryParam(eventId, categoryId)
    });
  }
}
