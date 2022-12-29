import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponentComponent } from '../shift-common/base-component/base-component.component';
import { CommonService } from '../shift-common/services/common.service';
import { AuthParams } from './auth.params';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent extends BaseComponentComponent<AuthParams> {
  phoneReactiveForm = new FormGroup({
    phone: new FormControl('', [
      Validators.pattern(/^([0][1-9][0-9](\s|)[0-9][0-9][0-9](\s|)[0-9][0-9](\s|)[0-9][0-9])$|^(([0][0]|\+)[1-9][0-9](\s|)[0-9][0-9](\s|)[0-9][0-9][0-9](\s|)[0-9][0-9](\s|)[0-9][0-9])$/),
      Validators.required
    ]),
  });
  validated = false;
  get phone() { return this.phoneReactiveForm.get('phone'); }

  errorString?: string;
  authChallengeVerificationCode?: string;
  authChallengeId?: string;

  constructor(common: CommonService) {
    super(common);
  }

  @fluffyLoading()
  async onCreateAuthChallenge() {
    this.validated = true;
    if (!this.phoneReactiveForm.valid) {
      return;
    }
    this.errorString = undefined;
  }

  @fluffyLoading()
  async onValidateAuthChallenge() {

  }
}
