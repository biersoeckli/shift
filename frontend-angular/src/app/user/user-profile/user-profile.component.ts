import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { fluffyCatch, fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { UserProfileParams } from './user-profile.params';
import * as Parse from 'parse';

export const SWISS_PHONE_NUMBER_REGEX = /^([0][1-9][0-9](\s|)[0-9][0-9][0-9](\s|)[0-9][0-9](\s|)[0-9][0-9])$|^(([0][0]|\+)[1-9][0-9](\s|)[0-9][0-9](\s|)[0-9][0-9][0-9](\s|)[0-9][0-9](\s|)[0-9][0-9])$/;

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent extends BaseComponent<UserProfileParams> {

  reactiveForm: FormGroup;
  validated = false;
  phoneError: string = '';

  get firstName() { return this.reactiveForm.get('firstName'); }
  get lastName() { return this.reactiveForm.get('lastName'); }
  get mail() { return this.reactiveForm.get('mail'); }
  get phone() { return this.reactiveForm.get('phone'); }

  constructor(common: CommonService) {
    super(common);
    this.reactiveForm = new FormGroup({
      firstName: new FormControl(this.currentUser?.get('firstName') ?? '', Validators.required),
      lastName: new FormControl(this.currentUser?.get('lastName') ?? '', Validators.required),
      mail: new FormControl(this.currentUser?.get('email') ?? '', [
        Validators.email,
        Validators.required
      ]),
      phone: new FormControl(this.currentUser?.get('phone') ?? '', Validators.required)
    });
  }


  @fluffyLoading()
  @fluffyCatch()
  async onSubmit() {
    this.phoneError = '';
    this.validated = true;
    if (!this.reactiveForm.valid || !this.currentUser) {
      return;
    }
    if (this.reactiveForm.value.phone && !SWISS_PHONE_NUMBER_REGEX.test(this.reactiveForm.value.phone) || this.reactiveForm.value.phone.length !== 10) {
      this.phoneError = 'Die Telefonnummer ist in einem ungültigen Format. Hinweis: Schweizer Telefonnummer in folgendem Format: 0791234567';
      return;
    }
    this.currentUser.set('firstName', this.reactiveForm.value.firstName);
    this.currentUser.set('lastName', this.reactiveForm.value.lastName);
    this.currentUser.set('email', this.reactiveForm.value.mail);
    this.currentUser.set('phone', this.reactiveForm.value.phone);
    await this.currentUser.save();

    await this.router.navigateByUrl(this.params.returnUrl || '/');
  }
}
