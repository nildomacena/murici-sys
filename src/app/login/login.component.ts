import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms'
import { FireService } from '../services/fire.service';

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
  constructor(public fire: FireService) {
    this.form = new FormGroup({
      'email': new FormControl('',[Validators.required, Validators.email]),
      'senha': new FormControl('', [Validators.required])
    });
    this.formSignup = new FormGroup({
      'emailSignup': new FormControl('',[Validators.required, Validators.email]),
      'senhaSignup': new FormControl('', [Validators.required]),
      'confirmaSenhaSignup': new FormControl('', [Validators.required]),
      'nomeEstabelecimento': new FormControl('', [Validators.required]),
      'nome': new FormControl('', [Validators.required]),
    });

    this.fire.getCategorias()
      .then(categorias => {
        console.log(categorias);
      })
  }

  ngOnInit() {
    jQuery('.modal').modal();
  }

  esqueceuSenha(){
    console.log('esqueceu senha');
  }

  solicitarAcesso(){
    console.log('Solicitar acesso');
    jQuery('#modalSignup').modal('open');
  }

  cadastrar(){
    console.log(this.formSignup.value);
    this.fire.cadastrarUsuario(this.formSignup.value);
  }

}
