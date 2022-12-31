import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import * as Parse from 'parse';
import { Injectable } from "@angular/core";
import { AuthParams } from "src/app/auth/auth.params";

@Injectable()
export class CanActivateAuthenticated implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return new Promise(async (resolve) => {
      try {
        const isLoggenId = !!(await Parse.User.current()?.fetch());
        if (!isLoggenId) {
          resolve(this.router.createUrlTree(['auth'], {
            queryParams: new AuthParams(window.location.pathname+window.location.search)
          }));
        } else {
          resolve(true);
        }
      } catch (ex) {
        console.error(ex);
        resolve(this.router.parseUrl('/'));
        Parse.User.logOut();
      }
    });
  }
}
