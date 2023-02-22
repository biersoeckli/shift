import { Component } from '@angular/core';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { RegistrationParams } from '../registration.params';
import { fluffyCatch, fluffyLoading } from 'ngx-fluffy-cow';
import * as Parse from 'parse';

@Component({
  selector: 'app-welcome-screen',
  templateUrl: './welcome-screen.component.html'
})
export class WelcomeScreenComponent extends BaseComponent<RegistrationParams> {
  event?: Parse.Object<Parse.Attributes>;

  constructor(common: CommonService) {
    super(common);
    this.init();
  }

  @fluffyLoading()
  @fluffyCatch()
  async init() {
    try {
    await Parse.User.logOut();
    } catch (ex) {
      console.warn('Parse error during logout:');
      console.warn(ex);
    }
    const query = new Parse.Query(Parse.Object.extend("Event"));
    this.event = await query.get(this.params.eventId);
  }

  @fluffyLoading()
  async nextStep() {
    await this.navigation.registrationUserDetails(this.params.eventId);
  }
}
