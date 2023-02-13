import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthParams } from 'src/app/auth/auth.params';
import { EventCategoryParam } from 'src/app/event-categories/event-category.param';
import { EventDetailParam } from 'src/app/event-planner/event-detail/event-detail.param';
import { PayoutParams } from 'src/app/payout/payout.params';
import { RegistrationParams } from 'src/app/registration/registration.params';
import { ShiftDetailParams } from 'src/app/shifts/shift-detail-edit/shift-detail.params';
import { UserEventDetailParams } from 'src/app/user/user-event-detail/user-event-detail.params';
import { UserProfileParams } from 'src/app/user/user-profile/user-profile.params';
import { VolunteerParams } from 'src/app/volunteer/volunteer.params';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(public readonly router: Router) { }

  async authenticate(returnUrl: string) {
    await this.router.navigate(['auth'], {
      queryParams: new AuthParams(returnUrl)
    });
  }

  async registrationUserDetails(eventId: string) {
    window.open('/user/profile?returnUrl=' + encodeURI('/register/category-chooser?eventId=' + eventId), '_self');
    
  }

  async userProfile(returnUrl: string) {
    await this.router.navigate(['user', 'profile'], {
      queryParams: new UserProfileParams(returnUrl)
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

  async userEventOverview(eventId: string) {
    await this.router.navigate(['user', 'event'], {
      queryParams: new UserEventDetailParams(eventId)
    });
  }

  async userEventShiftTable(eventId: string) {
    await this.router.navigate(['user', 'event', 'shift-table'], {
      queryParams: new UserEventDetailParams(eventId)
    });
  }

  async registrationConfirmation(eventId: string) {
    await this.router.navigate(['register', 'confirmation'], {
      queryParams: new RegistrationParams(eventId)
    });
  }

  async home() {
    await this.router.navigateByUrl('');
  }

  async eventDetail(eventId: string) {
    await this.router.navigate(['events', 'detail'], {
      queryParams: new EventDetailParam(eventId)
    });
  }

  async shiftsOverview(eventId: string) {
    await this.router.navigate(['shifts'], {
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

  async eventVolunteerOverview(eventId: string) {
    await this.router.navigate(['volunteers'], {
      queryParams: new VolunteerParams(eventId)
    });
  }

  async eventVolunteerDetail(eventId: string, userEventId: string) {
    await this.router.navigate(['volunteers', 'detail'], {
      queryParams: new VolunteerParams(eventId, userEventId)
    });
  }

  async eventVolunteerEdit(eventId: string, userEventId?: string) {
    await this.router.navigate(['volunteers', 'detail', 'edit'], {
      queryParams: new VolunteerParams(eventId, userEventId)
    });
  }

  async eventVolunteerContractConfig(eventId: string) {
    await this.router.navigate(['volunteers', 'contract-config', 'edit'], {
      queryParams: new VolunteerParams(eventId)
    });
  }

  async payoutConfigOverview(eventId: string) {
    await this.router.navigate(['payout-configs'], {
      queryParams: new PayoutParams(eventId)
    });
  }
  async payoutConfigEdit(eventId: string, userEventId?: string) {
    await this.router.navigate(['payout-configs', 'detail', 'edit'], {
      queryParams: new PayoutParams(eventId, userEventId)
    });
  }
}
