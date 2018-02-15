import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms'

declare var jQuery: any;

@Component({
  selector: 'app-estabelecimento',
  templateUrl: './estabelecimento.component.html',
  styleUrls: ['./estabelecimento.component.css']
})
export class EstabelecimentoComponent implements OnInit {
  form: FormGroup;
  constructor() { }

  ngOnInit() {
    jQuery('ul.tabs').tabs();
    jQuery('.materialboxed').materialbox();
    this.form = new FormGroup({
      'nome': new FormControl('',[Validators.required, Validators.email]),
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

    console.log(this.form);
    let horario:FormGroup = <FormGroup>this.form.controls['horario'];
    console.log(horario);
    Object.keys(horario.controls).map(key => {
      horario.controls[key].controls['descricao'].disable();
    })
  }

  onSubmit(){
    console.log(this.form.value);
  }

  onChangeDia(event:any, dia:string){
    if(this.form.controls['horario'].controls[dia].value.abre)
      <FormGroup>this.form.controls['horario'].controls[dia].controls['descricao'].enable();
    else
      this.form.controls['horario'].controls[dia].controls['descricao'].disable();
  }

}
