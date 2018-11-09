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
  sorteios: any[] = [];
  adminLogado: boolean = false;
  corpoNotificacao: string = '';
  tituloNotificacao: string = '';
  categorias: any[] = [];
  categoriaSelecionada: any;
  estabelecimentosCategoria: any[] = [];
  estabelecimentos: any[] = [];
  estabelecimentosFiltrados: any[] = [];
  imagemSorteio: any;
  pathImagemSorteio: any;
  dataSorteio: any;
  estabelecimentoKeyNotificacao: string;
  destaques: any[] = [];
  constructor(private afAuth: AngularFireAuth, private fire: FireService, private router: Router) {
    this.fire.getCategorias()
      .then(categorias => {
        this.categorias = categorias;
      });
    this.getSorteios();
    this.form = new FormGroup({
      'email': new FormControl('', [Validators.required, Validators.email]),
      'senha': new FormControl('', [Validators.required])
    });
    this.formCadastro = new FormGroup({
      'email': new FormControl('', [Validators.required, Validators.email]),
      'nome': new FormControl('', [Validators.required]),
      'categoria': new FormControl('', [Validators.required]),
      'imagemAdicional': new FormControl(false, [Validators.required]),
      'slides': new FormControl(false, [Validators.required])
    })
    this.formSorteio = new FormGroup({
      'titulo': new FormControl('', [Validators.required]),
      'texto': new FormControl('', [Validators.required]),
      'linkInstagram': new FormControl('', [Validators.required]),
      'imagem': new FormControl(''),
      'data': new FormControl(''),
      'estabelecimentoKey': new FormControl('', [Validators.required]),
      'estabelecimentoNome': new FormControl('')
    });
    this.afAuth.authState.subscribe(user => {
      if (user){
        this.fire.checaAdmin(user.uid)
          .then(admin => {
            console.log(admin);
            this.adminLogado = admin;
            setTimeout(() => {
              jQuery('ul.tabs').tabs();
              jQuery('.datepicker').pickadate({
                closeOnSelect: false,
                selectMonths: true,
                today: 'Hoje',
                clear: 'Limpar',
                close: 'Ok',
                onSet: date => {
                  this.dataSorteio = date.select;
                }
              });
            }, 200);
          });
      }
      else{
        this.fire.logout();
      }
    });
    this.getEstabelecimentos();
    this.getDestaques();
  }

  ngOnInit() {
    jQuery('ul.tabs').tabs();
    jQuery('select').material_select();
    jQuery('.modal').modal();
  }

  getEstabelecimentos() {
    this.fire.getEstabelecimentos()
      .then(estabelecimentos => {
        this.estabelecimentos = this.estabelecimentosFiltrados = estabelecimentos;
        console.log(estabelecimentos);
      });
  }

  getDestaques(){
    this.fire.getDestaques()
      .then(destaques => {
        this.destaques = destaques;
      });
  }
  getSorteios() {
    setTimeout(() => {
      this.fire.getSorteios()
        .then(sorteios => {
          this.sorteios = sorteios;
        })
    },1000)
  }

  login() {

    this.fire.login(this.form.value)
      .then(_ => {
        console.log('logado')
      })
  }
  consolar() {
    console.log(this.formSorteio)
  }
  filtraEstabelecimentos(event) {
    if (event.srcElement.value == '') {
      this.estabelecimentosFiltrados = this.estabelecimentos;
    }
    else {
      this.estabelecimentosFiltrados = this.estabelecimentos.filter(estabelecimento => {
        return estabelecimento.nome.toUpperCase().includes(event.srcElement.value.toUpperCase());
      })
    }
    console.log(event.srcElement.value);

  }
  enviarNotificacao(selectNotificacao, textareaNotificacao ) {
    console.log(selectNotificacao);
    if(!this.estabelecimentoKeyNotificacao || !this.corpoNotificacao)
      alert("Preencha todas as informações para enviar a notificação");
    else{
      if(confirm("Deseja realmente enviar uma notificação?"))
        this.fire.enviarNotificacao(this.tituloNotificacao, this.corpoNotificacao, this.estabelecimentoKeyNotificacao)
          .then(_ => {
            this.fire.toast('Notificação enviada');
            this.estabelecimentoKeyNotificacao = '';
            selectNotificacao.selectedIndex = 0;
            textareaNotificacao.value = '';
          })
    }
  }
  console() {
    let data = new Date(this.formSorteio.value['data']);
    console.log(this.formSorteio.value, data);
  }
  selectCategoria(categoria) {
    this.categoriaSelecionada = categoria;
    this.fire.getEstabelecimentosPorCategoria(categoria.key)
      .then(estabelecimentos => {
        console.log(estabelecimentos);
        this.estabelecimentosCategoria = estabelecimentos;
      })
  }

  onSelectEstabelecimento(estabelecimento) {
    console.log(estabelecimento);
    this.router.navigate(['estabelecimento'], { queryParams: { key: estabelecimento.key } });
  }

  onSubmitCadastro() {
    this.fire.cadastrarEstabelecimento(this.formCadastro.value)
      .then(_ => {
        this.fire.toast('Estabelecimento cadastrado.');
        this.fire.logout();
        this.formCadastro.reset();
      })
      .catch(err => {
        alert("Erro: " + err);
      })
  }

  habilitarEstabelecimento(estabelecimento, event) {
    this.fire.habilitarEstabelecimento(estabelecimento, event.path[0].checked)
      .then(_ => {
        this.fire.toast(event.path[0].checked ? 'Estabelecimento habilitado' : 'Estabelecimento desabilitado');
      })
  }

  uploadFileSorteio(event) {
    let file = this.imagemSorteio = event.target.files[0];
    let reader = new FileReader();
    reader.onload = (e => {
      //console.log(e.target.result);
      this.pathImagemSorteio = e.target['result'];
    });
    reader.readAsDataURL(file);

  }
  addSorteio() {
    jQuery('#modal-sorteio').modal('open');
  }
  deletarSorteio(sorteio) {
    if (confirm("Deseja realmente excluir o sorteio?"))
      this.fire.deletarSorteio(sorteio)
        .then(_ => {
          this.fire.toast('Sorteio deletado');
          this.getSorteios();
        })
  }

  onSubmitSorteio() {
    this.estabelecimentos.map(estabelecimento => {
      if (estabelecimento.key == this.formSorteio.value['estabelecimentoKey'])
        this.formSorteio.controls['estabelecimentoNome'].setValue(estabelecimento.nome);
    });
    console.log(this.formSorteio.value);
    this.formSorteio.controls['data'].setValue(new Date(this.dataSorteio).getTime());
    this.fire.salvarSorteio(this.formSorteio.value)
      .then(dados => {
        this.fire.salvarImagemSorteio(this.imagemSorteio, dados.key)
          .then(_ => {
            this.fire.toast('Sorteio salvo');
            jQuery('.modal').modal('close');
            this.formSorteio.reset();
            this.getSorteios();

          })
      })
  }

  realizarSorteio(sorteio) {
    this.fire.realizarSorteio(sorteio)
      .then(_ => {
        this.fire.toast('Sorteio realizado');
        this.getSorteios();
      });
  }

}
