import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CanActivateAuthenticated } from './shift-common/guards/authenticated.guard';

const routes: Routes = [
  {
    path: 'register',
    loadChildren: () => import('./registration/registration.module').then(m => m.RegistrationModule)
  }, {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  }, {
    path: '',
    component: HomeComponent,
    canActivate: [CanActivateAuthenticated]
  }, {
    path: '',
    loadChildren: () => import('./event-planner/event-planner.module').then(m => m.EventPlannerModule),
    canActivate: [CanActivateAuthenticated]
  }, {
    path: '',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
    canActivate: [CanActivateAuthenticated]
  }, {
    path: '',
    loadChildren: () => import('./shifts/shifts.module').then(m => m.ShiftsModule),
    canActivate: [CanActivateAuthenticated]
  }, {
    path: '',
    loadChildren: () => import('./volunteer/volunteer.module').then(m => m.VolunteerModule),
    canActivate: [CanActivateAuthenticated]
  }, {
    path: '',
    loadChildren: () => import('./payout/payout.module').then(m => m.PayoutModule),
    canActivate: [CanActivateAuthenticated]
  }, {
    path: '',
    loadChildren: () => import('./documents/documents.module').then(m => m.DocumentsModule),
    canActivate: [CanActivateAuthenticated]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
