import { Router } from '@angular/router';
import { FireService } from './../services/fire.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
declare var jQuery: any;

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  form: FormGroup;
  formCadastro: FormGroup;
  formSorteio: FormGroup;
  adminLogado: boolean = false;
  corpoNotificacao: string = '';
  categorias: any[] = [];
  categoriaSelecionada: any;
  estabelecimentosCategoria: any[] = [];
  estabelecimentos: any[] = [];
  estabelecimentosFiltrados: any[] = [];

  constructor(private afAuth: AngularFireAuth, private fire: FireService, private router: Router) {
    this.fire.getCategorias()
      .then(categorias => {
        this.categorias = categorias;
      });

    this.form = new FormGroup({
      'email': new FormControl('',[Validators.required, Validators.email]),
      'senha': new FormControl('', [Validators.required])
    });
    this.formCadastro = new FormGroup({
      'email': new FormControl('',[Validators.required, Validators.email]),
      'nome': new FormControl('',[Validators.required]),
      'categoria': new FormControl('',[Validators.required]),
      'imagemAdicional': new FormControl(false, [Validators.required]),
      'slides': new FormControl(false, [Validators.required])
    })
    this.formSorteio = new FormGroup({
      'texto': new FormControl('',[Validators.required]),
      'linkInstagram': new FormControl('',[Validators.required]),
      'imagem': new FormControl(''),
      'estabelecimentoKey': new FormControl('', [Validators.required])
    });
    this.afAuth.authState.subscribe(user =>{
      if(user)
        this.fire.checaAdmin(user.uid)
          .then(admin => {
            console.log(admin);
            this.adminLogado = admin;
            setTimeout(() => {
              jQuery('ul.tabs').tabs();              
            }, 200);
          });
    });
    this.fire.getEstabelecimentos()
      .then(estabelecimentos => {
        this.estabelecimentos = this.estabelecimentosFiltrados = estabelecimentos;
        console.log(estabelecimentos);
      })
  }

  ngOnInit() {
    jQuery('ul.tabs').tabs();
    jQuery('select').material_select();
  }

  login(){
    
    this.fire.login(this.form.value)
      .then(_ => {
        console.log('logado')
      })
  }

  filtraEstabelecimentos(event){
    if(event.srcElement.value == '')
      this.estabelecimentosFiltrados = this.estabelecimentos;
    else{
      this.estabelecimentosFiltrados = this.estabelecimentos.filter(estabelecimento => {
        return estabelecimento.nome.toUpperCase().includes(event.srcElement.value.toUpperCase());
      })
    }
    console.log(event.srcElement.value);

  }
  enviarNotificacao(){
    console.log('enviarNotificacao()',this.corpoNotificacao);
  }

  selectCategoria(categoria){
    this.categoriaSelecionada = categoria;
    this.fire.getEstabelecimentosPorCategoria(categoria.key)
      .then(estabelecimentos => {
        console.log(estabelecimentos);
        this.estabelecimentosCategoria = estabelecimentos;
      })
  }

  onSelectEstabelecimento(estabelecimento){
    console.log(estabelecimento);
    this.router.navigate(['estabelecimento'], {queryParams: {key: estabelecimento.key}});
  }

  onSubmitCadastro(){
    this.fire.cadastrarEstabelecimento(this.formCadastro.value)
      .then(_ => {
        this.fire.toast('Estabelecimento cadastrado.');
        this.formCadastro.reset();
      })
      .catch(err => {
        alert("Erro: "+err);
      })
  }

  habilitarEstabelecimento(estabelecimento, event){
    this.fire.habilitarEstabelecimento(estabelecimento, event.path[0].checked)
      .then(_ => {
        this.fire.toast(event.path[0].checked? 'Estabelecimento habilitado': 'Estabelecimento desabilitado');
      })
  }

  onSubmitSorteio(){
    console.log(this.formSorteio.value);
  }

}
