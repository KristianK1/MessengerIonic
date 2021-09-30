import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Injectable } from '@angular/core';
import { DatabaseReference } from '@angular/fire/compat/database/interfaces';

import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserData } from './interfaces/user-data';
import { DatabaseServiceService } from './services/database-service.service';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  constructor(private databaseService: DatabaseServiceService, private router: Router) { }

  userSubject: BehaviorSubject<UserData> = new BehaviorSubject<UserData>(null);

  loginUser(data: UserData) {
    if (data) {
      if (this.databaseService.userExists(data)===true) {
        this.userSubject.next(data);
        this.databaseService.logedinUserSet(data);
        this.router.navigate(["../home"]);
      }
      else{
        console.log("Nema korisnika u bazi");
        
      }
    }
  }

  RegisterUser(data: UserData) {
    if (this.databaseService.similarUserExists(data)==false) {
      this.databaseService.addUser(data);
    }
    else console.log("Slican korisnik postoji");
    

  }

}
