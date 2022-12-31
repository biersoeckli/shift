import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationComponent } from './registration.component';
import { RouterModule, Routes } from '@angular/router';
import { ShiftCommonModule } from '../shift-common/shift-common.module';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { WelcomeScreenComponent } from './welcome-screen/welcome-screen.component';
import { CanActivateAuthenticated } from '../shift-common/guards/authenticated.guard';

const routes: Routes = [
  {
    path: '',
    component: WelcomeScreenComponent,
  },
  {
    path: 'user',
    component: RegistrationComponent,
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
    RegistrationComponent,
    ConfirmationComponent,
    WelcomeScreenComponent
  ],
  imports: [
    CommonModule,
    ShiftCommonModule,
    RouterModule.forChild(routes),
  ]
})
export class RegistrationModule { }
