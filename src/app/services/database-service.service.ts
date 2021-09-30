import { Injectable } from '@angular/core';


import { getDatabase, ref, set, Database, onValue, child, get } from "firebase/database";

import { FirebaseApp } from "@angular/fire/app";

import { AngularFireModule } from "@angular/fire/compat";

import { AngularFireDatabase, AngularFireDatabaseModule } from '@angular/fire/compat/database';

import { environment } from 'src/environments/environment';
import { initializeApp } from '@firebase/app';
import { UserData } from '../interfaces/user-data';
import { BehaviorSubject } from 'rxjs';
import { UserServiceService } from '../user-service.service';
import { Chat } from '../interfaces/chat';
import { Message } from '../interfaces/message';

@Injectable({
  providedIn: 'root'
})
export class DatabaseServiceService {
  app: any = null;
  database: Database;
  counter: number = 0;

  logedinUser: UserData;

  allUsers: Array<UserData> = new Array<UserData>();  //koristi se samo kao temp varijabla
  allUsersSubject: BehaviorSubject<Array<UserData>> = new BehaviorSubject<Array<UserData>>(null);

  myChats: BehaviorSubject<Array<Chat>> = new BehaviorSubject<Array<Chat>>(null);

  myChatsTemp: Array<Chat> = [];

  constructor() {

    this.app = initializeApp(environment.firebaseConfig);
    this.database = getDatabase();
    this.createReferencetoUsers();
  }

  x: number = 0;

  logedinUserSet(user: UserData) {
    this.logedinUser = user;
    this.createReferencetoMyMessages();
  }

  userExists(userData: UserData): Boolean {
    if (this.allUsersSubject.value) {
      for (let i: number = 0; i < this.allUsersSubject.value.length; i++) {
        if (this.allUsersSubject.value[i].username === userData.username && this.allUsersSubject.value[i].username === userData.username) {
          return true;
        }
      }
    }
    return false;
  }

  similarUserExists(userData: UserData): Boolean {
    if (this.allUsersSubject.value) {
      for (let i: number = 0; i < this.allUsersSubject.value.length; i++) {
        if (this.allUsersSubject.value[i].username.toLocaleLowerCase() === userData.username.toLocaleLowerCase() && this.allUsersSubject.value[i].username.toLocaleLowerCase() === userData.username.toLocaleLowerCase()) {
          return true;
        }
      }
    }
    return false;
  }

  addUser(userData: UserData) {
    console.log("Korisnik dodan - Database service");
    if (this.allUsersSubject.value) {  //upitno
      for (let i: number = 0; i < this.allUsersSubject.value.length; i++) {
        set(ref(this.database, 'comms/' + userData.username + "_" + this.allUsersSubject.value[i].username), {
          Name1: userData.username,
          Name2: this.allUsersSubject.value[i].username,
          messages:
            [
              {
                sender: userData.username,
                text: "Hello. I am new on this app",
              },
            ]
        });
      }
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











  readData() {

    while (this.x < 10) {
      this.x++;

      let y = ref(this.database, 'users/');

      onValue(y, (snapshot) => {
        const data = snapshot.val();
        console.log(data);

      });
    }
  }


  createReferencetoUsers() {
    onValue(ref(this.database, 'users'), (snapshot) => {
      const DataBase_Users_data = (snapshot.val());

      if (DataBase_Users_data) {
        try {
          let keys = Object.keys(DataBase_Users_data);

          for (let i: number = 0; i < keys.length; i++) {
            let temp: UserData = {
              username: DataBase_Users_data[keys[i]].username,
              password: DataBase_Users_data[keys[i]].password
            }
            this.allUsers.push(temp);
          }
          this.allUsersSubject.next(this.allUsers);
          this.allUsers = []; //da se ne pojave dupli accounti kad registiram korisnika
          this.createReferencetoMyMessages();
        }
        catch (error) {
          console.log("GREŠKA PRI ČITANJU IZ BAZE");
          this.allUsers = [];  //mozda subject nulirat?
        }
      }
    },
      {
        onlyOnce: false
      }
    );
  }

  async readDataMessages(): Promise<Array<String>> {
    let temp: Array<String> = [];

    await get(child(ref(this.database), "comms")).then((snapshot) => {
      if (snapshot.exists()) {
        temp = Object.keys(snapshot.val());

      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
    return temp;
  }




  async createReferencetoMyMessages() {
    let numberOfConnections = this.allUsersSubject.value.length * (this.allUsersSubject.value.length - 1) / 2;
    let messageNames: Array<String> = [];
    await this.readDataMessages().then(val => {
      messageNames = val;
    });
    //got all messages names
    //now i need to filter my messages


    if (!this.logedinUser) console.log("masivna greška, korisnik je null ili undefined u database servisu");
    else {
      this.myChatsTemp = [];
      for (let i: number = 0; i < messageNames.length; i++) { //prolazi svim chatovima
        let name1: String = messageNames[i].split("_")[0];
        let name2: String = messageNames[i].split("_")[1];
        console.log("pretrazivanje po porukama |" + name1 + "|" + name2 + "|");

        if (this.logedinUser.username === name1 || this.logedinUser.username === name2) { //ude samo ako je moj chat


          //for (let i: number = 0; i < this.allUsersSubject.value.length; i++) {
          let tempSingleChat: Chat = {
            name1: name1,
            name2: name2,
            messages: [],
          }
          this.myChatsTemp.push(tempSingleChat);
          
          this.myChats.next(this.myChatsTemp);
          //}
          ////////////kreiraj referencu
          console.log("kreiranje reference izmedu" + name1 + " i " + name2);




          //ovaj dio moze ici i u odvojenu funkciju
          onValue(ref(this.database, 'comms/' + messageNames[i]), (snapshot) => {
            console.log("baza se pokrenila " + messageNames[i]);

            const commsBetweenUsers = (snapshot.val());
            if (commsBetweenUsers) {
              try {
                console.log("dogodila se promjena u commsu izmedu 2 korisnika");
                //console.log(snapshot.val());

                //<pronalazenje tog chata u myChats>
                if (this.myChats.value) {
                  this.myChatsTemp = this.myChats.value;
                  for (let j: number = 0; j < this.myChatsTemp.length; j++) {

                    if (messageNames[i] === this.myChatsTemp[j].name1 + "_" + this.myChatsTemp[j].name2) {

                      this.myChatsTemp[j].messages = [];
                      for (let k = 0; k < snapshot.val().messages.length; k++) {
                        let tempSingleMessage: Message = {
                          sender: snapshot.val().messages[k].sender,
                          text: snapshot.val().messages[k].text,
                        }
                        this.myChatsTemp[j].messages.push(tempSingleMessage);
                        console.log("pushed");
                        console.log(tempSingleMessage);


                      }
                    }
                  }
                }
                //</pronalazenje tog chata u myChats>
                console.log("temp mychats nakon update");

                console.log(this.myChatsTemp);
                
                console.log("NEXTAN MyChats u bazi");
                this.myChats.next(this.myChatsTemp);

              }
              catch (error) {
                console.log("GREŠKA PRI ČITANJU IZ BAZE");
              }
            }
          },
            {
              onlyOnce: false
            }
          );
          ///////////////
        }
      }
    }
  }


  uploadMessage(sender: String, reciver: String, message_text: String, message_number: number) {
    let wantedChat: String = "";
    let allChats = this.readDataMessages().then(val => {
      if (val)
        console.log(val);

      for (let i = 0; i < val.length; i++) {
        if ((val[i] === sender + "_" + reciver) || (val[i] === reciver + "_" + sender)) {
          wantedChat = val[i];

          /*let temp: Array<Chat> = this.myChats.value;
          temp[i].messages.push({
            sender: this.logedinUser.username,
            text: message_text,
          });

          this.myChats.next(temp);*/


          console.log("wanted convo");
          console.log(wantedChat);


        }
      }
      



      set(ref(this.database, 'comms/' + wantedChat + "/messages/" + message_number), {

        sender: this.logedinUser.username,
        text: message_text,

      });
    });


    //this.createReferencetoMyMessages();

  }



}
