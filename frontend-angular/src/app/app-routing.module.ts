import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
    loadChildren: () => import('./event-planner/event-planner.module').then(m => m.EventPlannerModule),
    canActivate: [CanActivateAuthenticated]
  }, {
    path: '',
    loadChildren: () => import('./shifts/shifts.module').then(m => m.ShiftsModule),
    canActivate: [CanActivateAuthenticated]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
