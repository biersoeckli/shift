import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from './base-component/base-component.component';
import { FluffyCowModule } from 'ngx-fluffy-cow';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderLogoComponent } from './header-logo/header-logo.component';
import { NavigationService } from './services/navigation.service';
import { CommonService } from './services/common.service';


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
    HeaderLogoComponent,
  ],
  providers: [
    NavigationService,
    CommonService
  ]
})
export class ShiftCommonModule { }
