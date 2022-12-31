import { Component } from '@angular/core';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { RegistrationParams } from '../registration.params';
import * as Parse from 'parse';
import { fluffyLoading } from 'ngx-fluffy-cow';

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

  nextStep() {
    this.navigation.authenticate('/register/user')
  }
}
