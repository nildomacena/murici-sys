import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms'
import { FireService } from '../services/fire.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { AgmMap } from '@agm/core';
//import {} from "@types/googlemaps";

declare var jQuery: any;
declare var Materialize: any;
declare var google: any;
@Component({
  selector: 'app-estabelecimento',
  templateUrl: './estabelecimento.component.html',
  styleUrls: ['./estabelecimento.component.css']
})
export class EstabelecimentoComponent implements OnInit {
  form: FormGroup;
  lat: number = -9.3133077;
  lng: number = -35.942441;
  latMarker: number;
  lngMarker: number;
  avatar;
  estabelecimento: any;
  user: any;
  admin: boolean;
  tags: any[] = [];
  imagensAdicionais: any;
  estabelecimentoKey: string;
  imagemAdicional;
  imagemAdicional_2;

  @ViewChild('agmMap') agmMap: AgmMap
  constructor(
    public fire: FireService,
    public spinnerService: Ng4LoadingSpinnerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = new FormGroup({
      'nome': new FormControl('', [Validators.required]),
      'nomeResponsavel': new FormControl('', [Validators.required]),
      'telefonePrimario': new FormControl('', [Validators.required]),
      'telefoneSecundario': new FormControl('', [Validators.required]),
      'descricao': new FormControl('', [Validators.required]),
      'logradouro': new FormControl('', [Validators.required]),
      'localizacao': new FormGroup({
        'lat': new FormControl(''),
        'lng': new FormControl(''),
      }),
      'horarioFuncionamento': new FormControl('', [Validators.required]),
      'horario': new FormGroup({
        'domingo': new FormGroup({
          'abre': new FormControl(false),
          'descricao': new FormControl(''),
        }),
        'segunda': new FormGroup({
          'abre': new FormControl(false),
          'descricao': new FormControl(''),
        }),
        'terca': new FormGroup({
          'abre': new FormControl(false),
          'descricao': new FormControl(''),
        }),
        'quarta': new FormGroup({
          'abre': new FormControl(false),
          'descricao': new FormControl(''),
        }),
        'quinta': new FormGroup({
          'abre': new FormControl(false),
          'descricao': new FormControl(''),
        }),
        'sexta': new FormGroup({
          'abre': new FormControl(false),
          'descricao': new FormControl(''),
        }),
        'sabado': new FormGroup({
          'abre': new FormControl(false),
          'descricao': new FormControl(''),
        }),
        'feriado': new FormGroup({
          'abre': new FormControl(false),
          'descricao': new FormControl(''),
        })
      })
    })
    this.route.queryParams.subscribe(params => {
      console.log(params);
      if (params.key) {
        this.estabelecimentoKey = params.key;
        this.admin = true;
        this.getEstabelecimentoByKey(params.key);
      }
      else
        this.fire.afAuth.authState.subscribe(user => {
          if (user) {
            this.user = user;
            this.fire.getEstabelecimentoByUid(user.uid)
              .then(estabelecimento => {
                if (estabelecimento.tags) {
                  let data: any[] = [];
                  this.tags = estabelecimento.tags;
                  estabelecimento.tags.map(tag => {
                    data.push({ tag: tag });
                  })
                  console.log(data);
                  jQuery('.chips').material_chip({
                    data: data,
                    limit: 3,

                  })
                }
                this.estabelecimento = estabelecimento;
                this.spinnerService.hide();
                this.atualizaForm();
              })
          }
        })
    })
  }

  getEstabelecimentoByKey(key) {
    this.fire.getEstabelecimentoByKey(key)
      .then(estabelecimento => {
        console.log(estabelecimento);
        if (estabelecimento.tags) {
          let data: any[] = [];
          this.tags = estabelecimento.tags;
          estabelecimento.tags.map(tag => {
            data.push({ tag: tag });
          })
          console.log(data);
          jQuery('.chips').material_chip({
            data: data,
            limit: 3,
            placeholder: 'Digite as tags para as pessoas acharem seu estabelecimento'
          })
        }
        this.estabelecimento = estabelecimento;
        this.spinnerService.hide();
        this.atualizaForm();
      })
  }

  atualizaForm() {
    this.form.controls['nome'].setValue(this.estabelecimento.nome);
    this.form.controls['nomeResponsavel'].setValue(this.estabelecimento.nomeResponsavel);
    this.form.controls['horarioFuncionamento'].setValue(this.estabelecimento.horarioFuncionamento);
    this.estabelecimento.descricao ? this.form.controls['descricao'].setValue(this.estabelecimento.descricao) : '';
    this.estabelecimento.telefonePrimario ? this.form.controls['telefonePrimario'].setValue(this.estabelecimento.telefonePrimario) : '';
    this.estabelecimento.telefoneSecundario ? this.form.controls['telefoneSecundario'].setValue(this.estabelecimento.telefoneSecundario) : '';
    this.estabelecimento.logradouro ? this.form.controls['logradouro'].setValue(this.estabelecimento.logradouro) : '';
    setTimeout(() => {
      Materialize.updateTextFields();
    }, 500);
  }
  ngOnInit() {
    console.log('ngOnInit');
    this.spinnerService.show();
    setTimeout(() => {
      jQuery('ul.tabs').tabs();
    }, 500);
    jQuery('.materialboxed').materialbox();
    jQuery('.modal').modal();
    jQuery('.chips').material_chip({
      limit: 3
    });
    jQuery('.chips').on('chip.add', (e, chip) => {
      console.log(e, chip);
      if (!this.estabelecimento.tags)
        this.estabelecimento.tags = [];
      this.estabelecimento.tags.push(chip.tag);

    });
    jQuery('.chips').on('chip.delete', (e, chip) => {
      let index = this.estabelecimento.tags.indexOf(chip.tag);
      this.estabelecimento.tags.splice(index, 1);
    });

    let horario: FormGroup = <FormGroup>this.form.controls['horario'];
    Object.keys(horario.controls).map(key => {
      let aux_control = <FormGroup>horario.controls[key];
      aux_control.controls['descricao'].disable();
    })
  }

  onSubmit() {
    if (this.estabelecimento.tags.length > 5) {
      alert(`Você só pode usar 5 tags. Delete ${this.estabelecimento.tags.length - 5} tag(s) para continuar`);
    }

    else {
      let estabelecimento;
      this.spinnerService.show();
      this.form.value['key'] = this.estabelecimento.key;
      estabelecimento = this.form.value;
      estabelecimento['tags'] = this.estabelecimento.tags;
      console.log(estabelecimento);
      this.fire.updateDadosEstabelecimento(estabelecimento)
        .then(_ => {
          console.log('atualizado');
          this.spinnerService.hide();
        });
    }

  }

  salvarEndereco() {
    this.spinnerService.show();
    this.fire.salvarEndereco({ lat: this.latMarker, lng: this.lngMarker })
      .then(_ => {
        this.spinnerService.hide();
      })
  }

  abrirModal() {
    console.log(this.form);
    this.agmMap.mapClick.subscribe(event => {
      this.latMarker = event.coords.lat;
      this.lngMarker = event.coords.lng;
    })
    jQuery('#modal_endereco').modal('open');
    this.agmMap.triggerResize();
  }

  setMap(lat: number, lng: number, marker?: boolean) {
    let map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: lat, lng: lng },
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP,

    });
    let latLng: google.maps.LatLng = new google.maps.LatLng(lat, lng);
    if (marker)
      console.log(map, latLng)

    google.maps.event.addListener(map, 'click', (event) => {
      console.log(map, event.latLng);
    });
  }

  uploadFile(event, imagem) {
    if (imagem == 'avatar')
      this.avatar = event.target.files[0];
    else if (imagem == 'imagemAdicional')
      this.imagemAdicional = event.target.files[0];
    else if (imagem == 'imagemAdicional_2')
      this.imagemAdicional_2 = event.target.files[0];
  }

  enviarImagens() {
    console.log(this.avatar, this.imagemAdicional, this.imagemAdicional_2)
    if(!this.avatar && !this.imagemAdicional && !this.imagemAdicional_2!)
      alert('Nada a atualizar!');
    else{
      this.spinnerService.show();
      this.fire.salvarImagens(this.avatar, this.imagemAdicional, this.imagemAdicional_2, this.estabelecimentoKey ? this.estabelecimentoKey : false)
        .then(result => {
          this.spinnerService.hide();
          this.avatar = this.imagemAdicional_2 = this.imagemAdicional = null;
          if (this.user)
            this.fire.getEstabelecimentoByUid(this.user.uid)
              .then(estabelecimento => {
                this.estabelecimento = estabelecimento;
              })
          else
            this.getEstabelecimentoByKey(this.estabelecimentoKey);
        })
        .catch(err => {
          console.error(err);
          alert('Ocorreu um erro durante a atualização. Tente novamente mais tarde. Se o erro persistir, entre em contato com o administrador do sistema.')
        })
    }

  }

  onChangeDia(event: any, dia: string) {
    let control_horario = <FormGroup>this.form.controls['horario'];
    if (control_horario.controls[dia].value.abre) {
      let control: FormGroup = <FormGroup>this.form.controls['horario'];
      let control_aux = <FormGroup>control.controls[dia];
      control_aux.controls['descricao'].enable();
    }
    else {
      let control: FormGroup = <FormGroup>this.form.controls['horario'];
      let control_aux = <FormGroup>control.controls[dia];
      control_aux.controls['descricao'].disable();
    }
  }

  openAdmin() {
    this.router.navigate(['admin']);
  }

  habilitarImagemAdicional() {
    if (this.imagensAdicionais == 'false')
      this.imagensAdicionais = false
    else
      this.imagensAdicionais = +this.imagensAdicionais;
    this.fire.habilitarImagemAdicional(this.estabelecimentoKey, this.imagensAdicionais)
      .then(_ => {
        this.fire.toast('Imagens atualizadas');
        this.getEstabelecimentoByKey(this.estabelecimentoKey);
      })
  }

}
