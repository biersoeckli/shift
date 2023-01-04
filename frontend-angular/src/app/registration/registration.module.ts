import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ShiftCommonModule } from '../shift-common/shift-common.module';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { WelcomeScreenComponent } from './welcome-screen/welcome-screen.component';
import { CanActivateAuthenticated } from '../shift-common/guards/authenticated.guard';
import { ShiftChooserComponent } from './shift-chooser/shift-chooser.component';
import { ShiftsModule } from '../shifts/shifts.module';

const routes: Routes = [
  {
    path: '',
    component: WelcomeScreenComponent,
  },
  {
    path: 'shift-chooser',
    component: ShiftChooserComponent,
    canActivate: [CanActivateAuthenticated]
  },
  {
    path: 'confirmation',
    component: ConfirmationComponent,
    canActivate: [CanActivateAuthenticated]
  }
];

@NgModule({
  declarations: [
    ConfirmationComponent,
    WelcomeScreenComponent,
    ShiftChooserComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    ShiftsModule,
    RouterModule.forChild(routes),
  ]
})
export class RegistrationModule { }
