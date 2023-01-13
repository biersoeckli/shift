import { Component } from '@angular/core';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { RegistrationParams } from '../registration.params';
import { fluffyLoading } from 'ngx-fluffy-cow';
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
  async init() {
    const query = new Parse.Query(Parse.Object.extend("Event"));
    this.event = await query.get(this.params.eventId);
  }

  @fluffyLoading()
  async nextStep() {
    await this.navigation.registrationUserDetails(this.params.eventId);
  }
}
