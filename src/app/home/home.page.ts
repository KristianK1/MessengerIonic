import { Component } from '@angular/core';
import { UserData } from '../interfaces/user-data';
import { DatabaseServiceService } from '../services/database-service.service';
import { UserServiceService } from '../user-service.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  otherUsers: Array<UserData> = new Array<UserData>();

  constructor(private databaseService: DatabaseServiceService, private userService: UserServiceService) {
    databaseService.allUsersSubject.subscribe(val => {
      if (val) {
        this.otherUsers = val?.filter(a => a.username !== userService.userSubject.value?.username);
      }
    });
  }

  messages: Array<String> = ["hello", "hello2", "hello3", "hello4", "hello5", "hello6", "hello7", "hello8", "hello9", "hello10", "hello11", "hello12", "hello13"];


}
