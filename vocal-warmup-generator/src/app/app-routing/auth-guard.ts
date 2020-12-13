import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isLogged = localStorage.getItem('logged');
    // TODO: This is not working for expired tokens!
    console.log('storage is logged ', isLogged);
    if (isLogged === 'true') {
        return true;
    }

    this.router.navigate(['/'], { queryParams: { returnUrl: state.url }});
    return false;
  }
}