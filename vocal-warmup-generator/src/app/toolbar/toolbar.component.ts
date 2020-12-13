import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { url } from '../../utils/baseUrl';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {}

  hideLogout() {
    const loggedIn = localStorage.getItem('logged') === 'true';
    return !loggedIn || this.router.url === '/';
  }

  logout() {
    // TODO: send logout request, on success, set localStorage logged to 'false', redirect to login page
    this.http.post(`${url}/users/logout`, {})
      .subscribe((response: any) => {
        console.log('logout successful');
        localStorage.setItem('logged', 'false');
        this.router.navigateByUrl('/');
      })
  }
}
