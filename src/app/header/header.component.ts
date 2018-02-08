import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FireService } from '../services/fire.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user:any;
  constructor(
    public fire: FireService,
    public router: Router
  ) { 
    this.fire.afAuth.authState
      .subscribe(user => {
        this.user = user;
      })
  }

  ngOnInit() {
  }

  sair(){
    this.fire.logout();
    this.router.navigate(['']);
  }
}
