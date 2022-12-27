import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponentComponent } from './base-component/base-component.component';
import { FluffyCowModule } from 'ngx-fluffy-cow';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderLogoComponent } from './header-logo/header-logo.component';


@NgModule({
  declarations: [
    HeaderLogoComponent
  ],
  imports: [
    CommonModule,
    FluffyCowModule,
    FormsModule
  ],
  exports: [
    FluffyCowModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderLogoComponent
  ]
})
export class ShiftCommonModule { }
