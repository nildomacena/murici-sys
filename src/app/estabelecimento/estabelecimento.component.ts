import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms'

@Component({
  selector: 'app-estabelecimento',
  templateUrl: './estabelecimento.component.html',
  styleUrls: ['./estabelecimento.component.css']
})
export class EstabelecimentoComponent implements OnInit {
  form: FormGroup
  constructor() { }

  ngOnInit() {
    this.form = new FormGroup({
      'nome': new FormControl('',[Validators.required, Validators.email]),
      'nomeResponsavel': new FormControl('', [Validators.required]),
      'telefonePrimario': new FormControl('', [Validators.required]),
      'telefoneSecundario': new FormControl('', [Validators.required]),
      'descricao': new FormControl('', [Validators.required]),
      'horario': new FormGroup({
        'domingo': new FormControl(''),
        'segunda': new FormControl(''),
        'terca': new FormControl(''),
        'quarta': new FormControl(''),
        'quinta': new FormControl(''),
        'sexta': new FormControl(''),
        'sabado': new FormControl(''),
        'feriado': new FormControl(''),
      })
    })
  }

  onSubmit(){
    console.log(this.form.value);
  }

}
