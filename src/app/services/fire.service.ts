import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database'
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireAction, DatabaseSnapshot } from 'angularfire2/database/interfaces';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';


@Injectable()
export class FireService {

  constructor(public db: AngularFireDatabase, public afAuth: AngularFireAuth) {

   }

  getCategorias():Promise<any>{
    return this.db.list('categorias').snapshotChanges().first().toPromise()
              .then(snap => {
                return Promise.resolve(this.snapshotParaValue(snap))
              });
    /*
    return this.db.list('categorias').snapshotChanges()
      .subscribe(snap => {
        return Promise.resolve(this.snapshotParaValue(snap))
      })*/
  }

  snapshotParaValue(lista: AngularFireAction<DatabaseSnapshot>[]){
    let novaLista = [];
    lista.map(objeto => {
      let novoObjeto = {};
      novoObjeto['key'] = objeto.key;
      let val = objeto.payload.val();
      Object.keys(val).map(key => {
        novoObjeto[key] = val[key]
      });
      novaLista.push(novoObjeto);
    });
    return novaLista;
  }

  cadastrarUsuario(cadastro: any){
    this.afAuth.auth.fetchProvidersForEmail(cadastro.emailSignup)
      .then(result => {
        console.log(result);
        if(result.length > 0){
          this.afAuth.auth.
        }
      })
    this.afAuth.auth.createUserWithEmailAndPassword(cadastro.emailSignup, cadastro.senhaSignup)
      .then(result => {
        console.log(result)
      })
      .catch(err => {
        console.error(err);
      })
  
  }
}
