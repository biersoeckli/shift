import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, } from '@angular/forms';
import { Router } from '@angular/router';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from '../shift-common/base-component/base-component.component';
import { CommonService } from '../shift-common/services/common.service';
import { RegistrationParams } from './registration.params';
import * as Parse from 'parse';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html'
})
export class RegistrationComponent extends BaseComponent<RegistrationParams> {

  reactiveForm: FormGroup;
  validated = false;
  currentUser: any;

  get firstName() { return this.reactiveForm.get('firstName'); }
  get lastName() { return this.reactiveForm.get('lastName'); }
  get mail() { return this.reactiveForm.get('mail'); }

  constructor(common: CommonService) {
    super(common);
    this.currentUser = Parse.User.current();
    this.reactiveForm = new FormGroup({
      firstName: new FormControl(this.currentUser.get('firstName') ?? '', Validators.required),
      lastName: new FormControl(this.currentUser.get('lastName') ?? '', Validators.required),
      mail: new FormControl(this.currentUser.get('email') ?? '', [
        Validators.email,
        Validators.required
      ]),
    });
  }


  @fluffyLoading()
  async onSubmit() {
    this.validated = true;
    if (!this.reactiveForm.valid) {
      return;
    }
    this.currentUser.set('firstName', this.reactiveForm.value.firstName);
    this.currentUser.set('lastName',  this.reactiveForm.value.lastName);
    this.currentUser.set('email',  this.reactiveForm.value.mail);
    await this.currentUser.save();

    this.router.navigateByUrl('/register/confirmation');
  }
}
