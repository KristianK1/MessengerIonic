import { IfStmt } from '@angular/compiler';
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
      this.myChats = val;
    });

    this.currentChat = {
      name1: "",
      name2: "",
      messages: [],
    }
    if (this.myChats) this.currentChat = this.myChats[0];

  }

  messages: Array<String> = ["hello", "hello2", "hello3", "hello4", "hello5", "hello6", "hello7", "hello8", "hello9", "hello10", "hello11", "hello12", "hello13"];

  changeChat(nameOfFriend: String) {
    console.log(nameOfFriend);
    for (let i = 0; i < this.otherUsers.length; i++) {
      if (nameOfFriend === this.otherUsers[i].username) {
        for (let j = 0; j < this.myChats.length; j++) {
          if ((this.myChats[j].name1 === this.logedinUser.username && this.myChats[j].name2 === this.otherUsers[i].username) || (this.myChats[j].name2 === this.logedinUser.username && this.myChats[j].name1 === this.otherUsers[i].username)) {
            this.currentChat = JSON.parse(JSON.stringify(this.myChats[j]));
          }
        }
      }
    }
    for (let i = 0; i < this.currentChat.messages.length; i++) {
      if (this.currentChat.messages[i].sender == this.logedinUser.username) {
        this.currentChat.messages[i].text = "Me: " + this.currentChat.messages[i].text;
      }
      else{
        this.currentChat.messages[i].text = this.currentChat.messages[i].sender + ": " + this.currentChat.messages[i].text;
        
      }

    }
  }
  message_text: String;
  SendMessage(){
    console.log(this.message_text);
    
  }

}
