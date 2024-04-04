import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from '../shift-common/base-component/base-component.component';
import { CommonService } from '../shift-common/services/common.service';
import { AuthParams } from './auth.params';
import * as Parse from 'parse';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent extends BaseComponent<AuthParams> {
  phoneReactiveForm = new FormGroup({
    phone: new FormControl('', [
      Validators.pattern(/^([0][1-9][0-9](\s|)[0-9][0-9][0-9](\s|)[0-9][0-9](\s|)[0-9][0-9])$|^(([0][0]|\+)[1-9][0-9](\s|)[0-9][0-9](\s|)[0-9][0-9][0-9](\s|)[0-9][0-9](\s|)[0-9][0-9])$/),
      Validators.required
    ]),
  });

  emailReactiveForm = new FormGroup({
    email: new FormControl('', [
      Validators.email,
      Validators.required
    ]),
  });

  validated = false;
  get phone() { return this.phoneReactiveForm.get('phone'); }
  get email() { return this.emailReactiveForm.get('email'); }

  errorString?: string;
  authChallengeVerificationCode?: string;
  authChallengeId?: string;

  loginType?: 'PHONE' | 'EMAIL';

  constructor(common: CommonService) {
    super(common);
  }

  @fluffyLoading()
  async onCreateAuthChallenge() {
    this.validated = true;

    if (this.loginType === 'EMAIL' && this.emailReactiveForm.invalid) {
      return;
    }
    if (this.loginType === 'PHONE' && this.phoneReactiveForm.invalid) {
      return;
    }
    try {
      this.errorString = undefined;
      if (this.loginType === 'EMAIL') {
        const { challengeId } = await Parse.Cloud.run('authenticateWithEmail', { email: this.emailReactiveForm.value.email?.replaceAll(' ', '') });
        this.authChallengeId = challengeId;
      } else {
        const { challengeId } = await Parse.Cloud.run('authenticateWithPhoneNumber', { phone: this.phoneReactiveForm.value.phone?.replaceAll(' ', '') });
        this.authChallengeId = challengeId;
      }
    } catch (e) {
      const ex = e as Parse.Error;
      this.errorString = ex?.message ? ex.message : 'Es ist ein Fehler aufgetreten.';
    }
  }

  @fluffyLoading()
  async onValidateAuthChallenge() {
    try {
      this.errorString = undefined;
      const { username, sessionKey } = await Parse.Cloud.run('verifyAuthChallengeCode', { authCode: this.authChallengeVerificationCode, challengeId: this.authChallengeId });
      await this.forceLogout();
      await Parse.User.logIn(username, sessionKey);
      await this.navigation.router.navigateByUrl(this.params.returnUrl?.replace('/ui', '').replace('%2Fui', '') ?? '/');
    } catch (e) {
      const ex = e as Parse.Error;
      this.errorString = ex?.message ? ex.message : 'Es ist ein Fehler aufgetreten.';
    }
  }

  async forceLogout() {
    try {
      await Parse.User.current()?.fetch();
    } catch (e) {
      // do nothing
    }

    try {
      await Parse.User.logOut();
    } catch (e) {
      // do nothing
    }
  }
}
