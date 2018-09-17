import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { FireService } from '../services/fire.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {
  form: FormGroup;

  constructor(
    public fire: FireService,
    public router:Router
  ) {
    this.form = new FormGroup({
      'email': new FormControl('', [Validators.required, Validators.email]),
      'senha': new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
  }

  
  login() {

    this.fire.login(this.form.value)
      .then(_ => {
        this.router.navigate(['admin']);
      })
  }
}
