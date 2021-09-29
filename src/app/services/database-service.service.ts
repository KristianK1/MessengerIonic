import { Injectable } from '@angular/core';


import { getDatabase, ref, set, Database, onValue } from "firebase/database";

import { FirebaseApp } from "@angular/fire/app";

import { AngularFireModule } from "@angular/fire/compat";

import { AngularFireDatabase, AngularFireDatabaseModule } from '@angular/fire/compat/database';

import { environment } from 'src/environments/environment';
import { initializeApp } from '@firebase/app';
import { UserData } from '../interfaces/user-data';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseServiceService {
  app: any = null;
  database: Database;
  counter: number = 0;

  allUsers: Array<UserData> = new Array<UserData>();
  allUsersSubject:  BehaviorSubject<Array<UserData>> = new BehaviorSubject<Array<UserData>>(null);

  constructor() {

    this.app = initializeApp(environment.firebaseConfig);
    this.database = getDatabase();
    this.createReference();
  }

  x: number = 0;

  userExists(userData: UserData): Boolean {
    if (this.allUsers) {
      for (let i: number = 0; i < this.allUsers.length; i++) {
        if (this.allUsers[i].username === userData.username && this.allUsers[i].username === userData.username) {
          return true;
        }
      }
    }
    return false;
  }

  similarUserExists(userData: UserData): Boolean {
    if (this.allUsers) {
      for (let i: number = 0; i < this.allUsers.length; i++) {
        if (this.allUsers[i].username.toLocaleLowerCase() === userData.username.toLocaleLowerCase() && this.allUsers[i].username.toLocaleLowerCase() === userData.username.toLocaleLowerCase()) {
          return true;
        }
      }
    }
    return false;
  }

  addUser(userData: UserData) {
    console.log("Korisnik dodan - Database service");

    for(let i: number = 0; i< this.allUsers.length;i++){
      set(ref(this.database, 'comms/' + userData.username+"_"+this.allUsers[i].username), {
        Name1: userData.username,
        Name2: this.allUsers[i].username,
        messages:
          [
            {
              name: userData.username,
              message: "Hello. I am new on this app",
            },
          ]
      });
    }

    set(ref(this.database, 'users/' + userData.username), {
      username: userData.username,
      password: userData.password,
    });

  }


  // setData() {
  //   set(ref(this.database, 'users/' + "Sviki" + this.counter), {
  //     username: 'Sviki',
  //     email: 'kikihd11',
  //   });
  //   this.counter++;

  //   this.x = 0;
  // }


  createReference() {
    onValue(ref(this.database, 'users'), (snapshot) => {
      const DataBase_Users_data = (snapshot.val());
    
      if(DataBase_Users_data){
        try{
          let keys = Object.keys(DataBase_Users_data);

          for(let i : number = 0; i<keys.length; i++){
            //this.allUsers.push(DataBase_Users_data[keys[i]]);
            // console.log(DataBase_Users_data[keys[i]].username);
            // console.log(DataBase_Users_data[keys[i]].password);
            let temp: UserData = {
              username: DataBase_Users_data[keys[i]].username,
              password: DataBase_Users_data[keys[i]].password
            }
            this.allUsers.push(temp);
          }
          this.allUsersSubject.next(this.allUsers);
        }
        catch(error){
          console.log("GREŠKA PRI ČITANJU IZ BAZE");
          this.allUsers = [];
        }
      }
    },
      {
        onlyOnce: false
      }
    );
  }









  readData() {
    console.log("bog mater");

    while (this.x < 10) {
      this.x++;
      console.log("isus");

      let y = ref(this.database, 'users/');

      onValue(y, (snapshot) => {
        const data = snapshot.val();
        console.log(data);

      });
    }
  }
}
