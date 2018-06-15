import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms'
import {} from '@types/googlemaps';
import { AgmMap } from '@agm/core';
import { FireService } from '../services/fire.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ActivatedRoute } from '@angular/router';

declare var jQuery: any;
declare var Materialize: any;

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
  admin: boolean;
  @ViewChild('agmMap') agmMap : AgmMap
  constructor(
    public fire: FireService,
    public spinnerService: Ng4LoadingSpinnerService,
    private route: ActivatedRoute
    ) {
      this.form = new FormGroup({
        'nome': new FormControl('',[Validators.required]),
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
        this.spinnerService.show();
        console.log(params);
        if(params.key){
          this.admin = true;
          this.fire.getEstabelecimentoByKey(params.key)
            .then(estabelecimento =>{
              console.log(estabelecimento);
              this.estabelecimento = estabelecimento;
              this.spinnerService.hide();
              this.atualizaForm();
            })
        }
        else
          this.fire.afAuth.authState.subscribe(user => {
            if(user){
              this.user = user;
              this.fire.getEstabelecimentoByUid(user.uid)
                .then(estabelecimento => {
                  console.log(estabelecimento);
                  this.estabelecimento = estabelecimento;
                  this.spinnerService.hide();
                  this.atualizaForm();
                })
            }
          })
      })
  }

  atualizaForm(){
    this.form.controls['nome'].setValue(this.estabelecimento.nome);
    this.form.controls['nomeResponsavel'].setValue(this.estabelecimento.nomeResponsavel);
    this.form.controls['horarioFuncionamento'].setValue(this.estabelecimento.horarioFuncionamento);
    this.estabelecimento.descricao? this.form.controls['descricao'].setValue(this.estabelecimento.descricao): '';
    this.estabelecimento.telefonePrimario? this.form.controls['telefonePrimario'].setValue(this.estabelecimento.telefonePrimario): '';
    this.estabelecimento.telefoneSecundario? this.form.controls['telefoneSecundario'].setValue(this.estabelecimento.telefoneSecundario): '';
    this.estabelecimento.logradouro? this.form.controls['logradouro'].setValue(this.estabelecimento.logradouro): '';
    setTimeout(() => {
      Materialize.updateTextFields();
    }, 500);
  }
  ngOnInit() {
    setTimeout(() => {
      jQuery('ul.tabs').tabs();
    }, 500);
    jQuery('.materialboxed').materialbox();
    jQuery('.modal').modal();
    let horario:FormGroup = <FormGroup>this.form.controls['horario'];
    Object.keys(horario.controls).map(key => {
      let aux_control = <FormGroup>horario.controls[key];
      aux_control.controls['descricao'].disable();
    })
  }

  onSubmit(){
    this.spinnerService.show();
    this.form.value['key'] = this.estabelecimento.key;
    console.log(this.form.value);
    this.fire.updateDadosEstabelecimento(this.form.value)
      .then(_ => {
        console.log('atualizado');
        this.spinnerService.hide();
      })
    
  }

  salvarEndereco(){
    this.spinnerService.show();
    this.fire.salvarEndereco({lat:this.latMarker, lng:this.lngMarker})
      .then(_ => {
        this.spinnerService.hide();
      })
  }

  abrirModal(){
    console.log(this.form);
    this.agmMap.mapClick.subscribe(event => {
      this.latMarker = event.coords.lat;
      this.lngMarker = event.coords.lng;
    })
    jQuery('#modal_endereco').modal('open');
    this.agmMap.triggerResize();
  }

  setMap(lat:number, lng:number, marker?:boolean){
    let map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: lat, lng: lng},
      zoom: 16,
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
        this.fire.getEstabelecimentoByUid(this.user.uid)
          .then(estabelecimento => {
            this.estabelecimento = estabelecimento;
          })
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
