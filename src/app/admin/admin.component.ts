import { FireService } from './../services/fire.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  form: FormGroup;
  formCadastro: FormGroup;
  adminLogado: boolean = false;
  corpoNotificacao: string = '';
  constructor(private afAuth: AngularFireAuth, private fire: FireService) { 
    this.form = new FormGroup({
      'email': new FormControl('',[Validators.required, Validators.email]),
      'senha': new FormControl('', [Validators.required])
    });
    this.formCadastro = new FormGroup({
      'email': new FormControl('',[Validators.required, Validators.email]),
    })
    this.afAuth.authState.subscribe(user =>{
      if(user)
        this.fire.checaAdmin(user.uid)
          .then(admin => {
            console.log(admin);
            this.adminLogado = admin;
          })

    })
  }

  ngOnInit() {
  }

  login(){
    
    this.fire.login(this.form.value)
      .then(_ => {
        console.log('logado')
      })
  }

  enviarNotificacao(){
    console.log('enviarNotificacao()',this.corpoNotificacao);
  }
}
