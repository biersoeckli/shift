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
import { MatDialogModule } from '@angular/material/dialog';
import { LoaderComponent } from './components/loader/loader.component';
import { EventService } from './services/event.service';
import { HtmlContentExporterService } from './services/html-content-exporter.service';
import { TimeFromToPipe } from './pipes/time-from-to.pipe';
import { TimeInputComponent } from './components/time-input/time-input.component';
import { ToggleSwitchComponent } from './components/toggle-switch/toggle-switch.component';


@NgModule({
  declarations: [
    HeaderLogoComponent,
    DateInputComponent,
    DatetimeInputComponent,
    BackArrowComponent,
    DateFromToPipe,
    TimeFromToPipe,
    LoaderComponent,
    TimeInputComponent,
    ToggleSwitchComponent
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
    DateFromToPipe,
    MatDialogModule,
    TimeFromToPipe,
    LoaderComponent,
    TimeInputComponent,
    ToggleSwitchComponent
  ],
  providers: [
    CanActivateAuthenticated,
    HtmlContentExporterService
  ]
})
export class ShiftCommonModule { }
