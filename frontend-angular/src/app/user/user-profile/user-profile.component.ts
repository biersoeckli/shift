import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { fluffyLoading } from 'ngx-fluffy-cow';
import { BaseComponent } from 'src/app/shift-common/base-component/base-component.component';
import { CommonService } from 'src/app/shift-common/services/common.service';
import { UserProfileParams } from './user-profile.params';
import * as Parse from 'parse';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent extends BaseComponent<UserProfileParams> {

  reactiveForm: FormGroup;
  validated = false;

  get firstName() { return this.reactiveForm.get('firstName'); }
  get lastName() { return this.reactiveForm.get('lastName'); }
  get mail() { return this.reactiveForm.get('mail'); }

  constructor(common: CommonService) {
    super(common);
    this.reactiveForm = new FormGroup({
      firstName: new FormControl(this.currentUser?.get('firstName') ?? '', Validators.required),
      lastName: new FormControl(this.currentUser?.get('lastName') ?? '', Validators.required),
      mail: new FormControl(this.currentUser?.get('email') ?? '', [
        Validators.email,
        Validators.required
      ]),
    });
  }


  @fluffyLoading()
  async onSubmit() {
    this.validated = true;
    if (!this.reactiveForm.valid || !this.currentUser) {
      return;
    }
    this.currentUser.set('firstName', this.reactiveForm.value.firstName);
    this.currentUser.set('lastName',  this.reactiveForm.value.lastName);
    this.currentUser.set('email',  this.reactiveForm.value.mail);
    await this.currentUser.save();

    await this.router.navigateByUrl(this.params.returnUrl || '/');
  }
}
