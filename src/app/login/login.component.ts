import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms'
import { FireService } from '../services/fire.service';
import { Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

declare var jQuery: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  formSignup: FormGroup;
  categorias: any[];
  loading: boolean = true;
  constructor(
    public fire: FireService,
    public router: Router,
    public spinnerService: Ng4LoadingSpinnerService
  ) {
    this.loading = true;
    this.form = new FormGroup({
      'email': new FormControl('',[Validators.required, Validators.email]),
      'senha': new FormControl('', [Validators.required])
    });
    this.formSignup = new FormGroup({
      'emailSignup': new FormControl('',[Validators.required, Validators.email]),
      'senhaSignup': new FormControl('', [Validators.required]),
      'categoria': new FormControl('', [Validators.required]),
      'confirmaSenhaSignup': new FormControl('', [Validators.required]),
      'nomeEstabelecimento': new FormControl('', [Validators.required]),
      'nome': new FormControl('', [Validators.required]),
    });
    this.spinnerService.show();
    setTimeout(() => {
      this.spinnerService.hide();
      if(this.fire.afAuth.auth.currentUser)
        this.router.navigate(['estabelecimento']);
    }, 500);

    this.fire.getCategorias()
      .then(categorias => {
        this.categorias = categorias;
      })
  }

  ngOnInit() {
    jQuery('.modal').modal();
  }

  esqueceuSenha(){
    console.log('esqueceu senha');
  }

  solicitarAcesso(){
    jQuery('#modalSignup').modal('open');
  }

  cadastrar(){
    this.loading = true;
    this.spinnerService.show();
    this.fire.cadastrarUsuario(this.formSignup.value)
      .then(user => {
        this.fire.salvarDadosUsuário(this.formSignup.value)
          .then(_ =>{
            alert("Cadastro realizado com sucesso. Aguarde enquanto aprovamos sua conta.");
            jQuery('#modalSignup').modal('close');
            this.spinnerService.hide();
          })
      })
      .catch(err => {
        this.spinnerService.hide();
        jQuery('#modalSignup').modal('close');
        console.log(err);
        if(err.code == 'auth/provider-already-linked' || err.code == "auth/email-already-in-use")
          alert("Email já utilizado. Utilize o formulário de login.");
        else
          alert("Aconteceu um erro durante o cadastro. Envie um email pra hagiosdev@gmail.com");
      })
  }

  teste(){
    this.loading = true;
  }


  login(){
    this.spinnerService.show();
    this.fire.login(this.form.value)
      .then(_ => {
        this.router.navigate(['estabelecimento'])
          .then(_ =>{
            this.spinnerService.hide();
          })
      })
  }

}
