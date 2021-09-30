
import { Component } from '@angular/core';
import { Chat } from '../interfaces/chat';
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
  logedinUser: UserData;
  myChats: Array<Chat> = new Array<Chat>();
  messagesForDisplay: Array<String> = new Array<String>();
  currentChat: Chat;

  constructor(private databaseService: DatabaseServiceService, private userService: UserServiceService) {
    databaseService.allUsersSubject.subscribe(val => {
      if (val) {
        this.otherUsers = val?.filter(a => a.username !== userService.userSubject.value?.username);
      }
    });
    userService.userSubject.subscribe(val => {
      this.logedinUser = val;
      //mozda trebam nesto napraviti kad se promjeni korisnik...
    });
    databaseService.myChats.subscribe(val => {
      if (val) {
        console.log("updatean myChats u home page-u");
        

        this.myChats = val;
        console.log(this.myChats);
        
        //kad kliknes change chat refresha se, a automatski nece pa cu ga ja ovdje changat "manualno"
        if (this.currentChat) {
          if (this.currentChat.name1 === this.logedinUser.username) this.changeChat(this.currentChat.name2);
          else this.changeChat(this.currentChat.name1);
        }
        this.displayMessages();
      }
    });

    this.currentChat = {
      name1: "",
      name2: "",
      messages: [],
    }
    if (this.myChats) this.currentChat = this.myChats[0];

  }

  changeChat(nameOfFriend: String) {
    console.log(nameOfFriend);
    for (let i = 0; i < this.otherUsers.length; i++) {
      if (nameOfFriend === this.otherUsers[i].username) {
        for (let j = 0; j < this.myChats.length; j++) {
          if ((this.myChats[j].name1 === this.logedinUser.username && this.myChats[j].name2 === nameOfFriend) || (this.myChats[j].name2 === this.logedinUser.username && this.myChats[j].name1 === nameOfFriend)) {
            this.currentChat = JSON.parse(JSON.stringify(this.myChats[j]));
            console.log("pronasao korisnika");
            console.log(this.currentChat);


          }
        }
      }
    }

    this.displayMessages();
    // for (let i = 0; i < this.currentChat.messages.length; i++) {
    //   if (this.currentChat.messages[i].sender == this.logedinUser.username) {
    //     this.currentChat.messages[i].text = "Me: " + this.currentChat.messages[i].text;
    //   }
    //   else {
    //     this.currentChat.messages[i].text = this.currentChat.messages[i].sender + ": " + this.currentChat.messages[i].text;

    //   }

    // }
  }

  message_text: String;
  SendMessage() {
    if (this.currentChat.name1.length > 0) {
      console.log(this.message_text);
      let reciver: String;
      if (this.currentChat.name1 === this.logedinUser.username) reciver = this.currentChat.name2;
      else reciver = this.currentChat.name1;
      this.databaseService.uploadMessage(this.logedinUser.username, reciver, this.message_text, this.currentChat.messages.length);
    }
    else console.log("nije odabran chat");

  }

  displayMessages() {
    this.messagesForDisplay = [];
    if (this.currentChat) {
      for (let i = 0; i < this.myChats.length; i++) {
        if (this.myChats[i].name1 == this.currentChat.name1 && this.myChats[i].name2 == this.currentChat.name2) {
          for (let j = 0; j < this.currentChat.messages.length; j++) {
            let temp: String;
            if (this.myChats[i].messages[j].sender == this.logedinUser.username) {
              temp = "Me: " + this.myChats[i].messages[j].text;
            }
            else {
              temp = this.myChats[i].messages[i].sender + ": " + this.myChats[i].messages[i].text;
            }
            this.messagesForDisplay.push(temp);
          }
        }
      }
    }
  }
}
