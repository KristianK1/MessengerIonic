import { Component, OnInit } from '@angular/core';
import { UserServiceService } from 'src/app/user-service.service';

import { UserData } from 'src/app/interfaces/user-data';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  mode: boolean = true;
  username_login: String = "";
  password_login: String = "";

  constructor(private userService: UserServiceService) { }

  ngOnInit() {
  }

  login() {
    if (this.username_login != "" && this.password_login != "") {
     
      let data: UserData = {
        username: this.username_login,
        password: this.password_login
      };
      this.userService.loginUser(data);
    }
  }

  register() {
    if (this.username_login.length >= 5 && this.password_login.length >= 5) {
     
      let data: UserData = {
        username: this.username_login,
        password: this.password_login
      };
      this.userService.RegisterUser(data);
    }
  }

}
