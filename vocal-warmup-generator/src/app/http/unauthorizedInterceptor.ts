import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor
} from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {

    return next.handle(request)
      .pipe(
        tap(
          event => {},
          // Operation failed; error is an HttpErrorResponse
          error => {
            if (error.status === 401) {
              this.router.navigate(['/']);
            }
          }
        ),
      );
  }
}