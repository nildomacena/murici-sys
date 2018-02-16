import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms'
import {} from '@types/googlemaps';
import { AgmMap } from '@agm/core';
import { FireService } from '../services/fire.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

declare var jQuery: any;

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
  imagemAdicional;
  estabelecimento: any;
  user: any;
  @ViewChild('agmMap') agmMap : AgmMap
  constructor(
    public fire: FireService,
    public spinnerService: Ng4LoadingSpinnerService
  ) {
    this.fire.afAuth.authState.subscribe(user => {
      if(user){
        this.user = user;
        this.fire.getEstabelecimentoById(user.uid)
          .then(estabelecimento => {
            this.estabelecimento = estabelecimento;
          })
        console.log(user, this.estabelecimento);
      }
    })
    this.form = new FormGroup({
      'nome': new FormControl('',[Validators.required]),
      'nomeResponsavel': new FormControl('', [Validators.required]),
      'telefonePrimario': new FormControl('', [Validators.required]),
      'telefoneSecundario': new FormControl('', [Validators.required]),
      'descricao': new FormControl('', [Validators.required]),
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
  }

  ngOnInit() {
    jQuery('ul.tabs').tabs();
    jQuery('.materialboxed').materialbox();
    jQuery('.modal').modal();
    //this.setMap(-9.3108144,-35.9434227)
    let horario:FormGroup = <FormGroup>this.form.controls['horario'];
    Object.keys(horario.controls).map(key => {
      let aux_control = <FormGroup>horario.controls[key];
      aux_control.controls['descricao'].disable();
    })
  }

  onSubmit(){
    console.log(this.form.value);
  }

  abrirModal(){
    console.log(this.form);
    this.agmMap.mapClick.subscribe(event => {
      console.log(event);
      this.latMarker = event.coords.lat;
      this.lngMarker = event.coords.lng;
    })
    jQuery('#modal_endereco').modal('open');
    this.agmMap.triggerResize();
  }

  setMap(lat:number, lng:number, marker?:boolean){
    let map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: lat, lng: lng},
      zoom: 18,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      
    });
    let latLng: google.maps.LatLng = new google.maps.LatLng(lat, lng);
    if(marker)
      console.log(map, latLng)

    google.maps.event.addListener(map, 'click', (event) => {
      console.log(map, event.latLng);
    });
  }

  uploadFile(event, imagem){
    if(imagem == 'avatar')
     this.avatar = event.target.files[0];
    if(imagem == 'imagemAdicional')
    this.imagemAdicional = event.target.files[0];
  }

  enviarImagens(){
    console.log(this.avatar, this.imagemAdicional)
    this.spinnerService.show();
    this.fire.salvarImagens(this.avatar, this.imagemAdicional)
      .then(result => {
        this.spinnerService.hide();
        this.fire.getEstabelecimentoById(this.user.uid)
          .then(estabelecimento => {
            this.estabelecimento = estabelecimento;
          })
        console.log(result);
      })
  
  }

  onChangeDia(event:any, dia:string){
    let control_horario = <FormGroup>this.form.controls['horario'];
    if(control_horario.controls[dia].value.abre){
      let control:FormGroup = <FormGroup>this.form.controls['horario'];
      let control_aux = <FormGroup>control.controls[dia];
      control_aux.controls['descricao'].enable();
    }
    else{
      let control:FormGroup = <FormGroup>this.form.controls['horario'];
      let control_aux = <FormGroup>control.controls[dia];
      control_aux.controls['descricao'].disable();
    }
  }

}
