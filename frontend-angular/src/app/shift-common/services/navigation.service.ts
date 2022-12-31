import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthParams } from 'src/app/auth/auth.params';

@Injectable()
export class NavigationService {

  constructor(public readonly router: Router) { }

  authenticate(returnUrl: string) {
    this.router.navigate(['auth'], {
      queryParams: new AuthParams(returnUrl)
    });
  }
}
