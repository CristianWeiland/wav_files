import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { url } from '../../utils/baseUrl';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private router: Router, private http: HttpClient, private _snackBar: MatSnackBar) {}

  title = 'Vocal warmup generator';

  login = {
    email: 'john@bravo.com',
    password: 'johnbravorocks',
  };

  register = {
    firstName: 'john',
    lastName: 'bravo',
    email: 'john@bravo.com',
    password: 'johnbravorocks',
  }

  loggingIn: boolean = false;
  registering: boolean = false;

  handleLogin() {
    if (this.loggingIn) {
      return;
    }

    this.loggingIn = true;
    if (!this.login.email || !this.login.password) {
      this._snackBar.open('Please fill your email and password.', 'Ok', { duration: 5000 });
      this.loggingIn = false;
      return;
    }

    this.http.get(`${url}/users/login`, { withCredentials: true, observe: 'response', params: this.login })
      .subscribe((response: any) => {
        this.loggingIn = false;
        this.router.navigateByUrl('warmups');
      }, err => {
        console.log('err', err);

        this.loggingIn = false;
        this._snackBar.open('Invalid login or password', 'Ok', { duration: 5000 });
      });

/*
      let postOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true, 
        observe: 'response' as 'response',
      };
    this.http.post(`${url}/users/login`, { user: this.login }, postOptions)
    .subscribe((response: any) => {
      console.log('resp', response);

      console.log(response.headers.get('Set-Cookie'));
      console.log(response.headers.get('X-TEST'));
      const keys = response.headers.keys();
      let headers = keys.map(key =>
        `${key}: ${response.headers.get(key)}`);
      
      console.log(headers);

      this.loggingIn = false;
      //this.router.navigateByUrl('warmups');
    }, err => {
      console.log('err', err);

      this.loggingIn = false;
      this._snackBar.open('Invalid login or password', 'Ok', { duration: 5000 });
    });
*/
  }

  handleRegister() {
    if (this.registering) {
      return;
    }

    this.registering = true;
    if (!this.register.email || !this.register.password || !this.register.firstName || !this.register.lastName) {
      this._snackBar.open('Please fill all fields form the form.', '', { duration: 5000 });
      this.registering = false;
      return;
    }

    this.http.post(`${url}/users/register`, { user: this.register })
      .subscribe((response: any) => {
        console.log(response);
        this.registering = false;
      }, err => {
        console.log(err);

        this.registering = false;
        this._snackBar.open(err.error.message, '', { duration: 5000 });
      });
  }
}
