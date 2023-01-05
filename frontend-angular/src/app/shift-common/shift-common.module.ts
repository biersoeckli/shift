import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from './base-component/base-component.component';
import { FluffyCowModule } from 'ngx-fluffy-cow';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderLogoComponent } from './header-logo/header-logo.component';
import { NavigationService } from './services/navigation.service';
import { CommonService } from './services/common.service';
import { CanActivateAuthenticated } from './guards/authenticated.guard';
import { DateInputComponent } from './components/date-input/date-input.component';
import { DatetimeInputComponent } from './components/datetime-input/datetime-input.component';
import { BackArrowComponent } from './components/back-arrow/back-arrow.component';
import { DateFromToPipe } from './pipes/date-from-to.pipe';


@NgModule({
  declarations: [
    HeaderLogoComponent,
    DateInputComponent,
    DatetimeInputComponent,
    BackArrowComponent,
    DateFromToPipe
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
    DateInputComponent,
    DatetimeInputComponent,
    BackArrowComponent,
    DateFromToPipe
  ],
  providers: [
    NavigationService,
    CommonService,
    CanActivateAuthenticated
  ]
})
export class ShiftCommonModule { }
