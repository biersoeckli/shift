import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, } from '@angular/forms';
import { Router } from '@angular/router';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponentComponent } from '../shift-common/base-component/base-component.component';
import { CommonService } from '../shift-common/services/common.service';
import { RegistrationParams } from './registration.params';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html'
})
export class RegistrationComponent extends BaseComponentComponent<RegistrationParams> {

  reactiveForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    phone: new FormControl('', [
      Validators.pattern(/^([0][1-9][0-9](\s|)[0-9][0-9][0-9](\s|)[0-9][0-9](\s|)[0-9][0-9])$|^(([0][0]|\+)[1-9][0-9](\s|)[0-9][0-9](\s|)[0-9][0-9][0-9](\s|)[0-9][0-9](\s|)[0-9][0-9])$/),
      Validators.required
    ]),
    mail: new FormControl('', [
      Validators.email,
      Validators.required
    ]),
  });
  validated = false;

  get firstName() { return this.reactiveForm.get('firstName'); }
  get lastName() { return this.reactiveForm.get('lastName'); }
  get phone() { return this.reactiveForm.get('phone'); }
  get mail() { return this.reactiveForm.get('mail'); }

  constructor(common: CommonService) {
    super(common);
  }

  @fluffyLoading()
  async onSubmit() {
    this.validated = true;
    if (!this.reactiveForm.valid) {
      return;
    }
    const values = this.reactiveForm.value;
    // todo let the async magic happen
    // todo redirect to auth page with redirect url to confirmation page
    this.router.navigateByUrl('/register/confirmation');
  }
}
