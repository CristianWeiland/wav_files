import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  title = 'Vocal warmup generator';

  email = 'a';
  password = 'a';

  handleLogin() {
    if (this.email === 'a' && this.password === 'a') {
      this.router.navigateByUrl('warmups');
    } else {
      window.alert('Wrong username or password.');
    }
  }
}
