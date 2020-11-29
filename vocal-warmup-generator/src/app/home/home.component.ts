import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  title = 'Vocal warmup generator';

  email = 'a';
  password = 'a';

  handleLogin() {
    if (this.email === 'a' && this.password === 'a') {
      window.alert('Logged in!');
    } else {
      window.alert('Wrong username or password.');
    }
  }
}
