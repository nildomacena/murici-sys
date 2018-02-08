import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database'
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireAction, DatabaseSnapshot } from 'angularfire2/database/interfaces';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import * as firebase from 'firebase';

@Injectable()
export class FireService {
  providerNewUser: any;

  constructor(public db: AngularFireDatabase, public afAuth: AngularFireAuth) {
    firebase.auth().getRedirectResult().then(result => {
      console.log(result);
      
    })
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

  cadastrarUsuario(cadastro: any):Promise<any>{
    return this.afAuth.auth.fetchProvidersForEmail(cadastro.emailSignup)
      .then(result => {
        console.log(result);
        if(result.length > 0){
          alert('Como você já tem uma conta criada com o login do Facebook, é necessário que faça o login nesse site para continuar.');
          this.providerNewUser = firebase.auth.EmailAuthProvider.credential(cadastro.emailSignup, cadastro.senhaSignup);
          this.afAuth.auth.signInWithRedirect()
            .then(resultSignIn => {
              console.log(resultSignIn);
            })
          firebase.auth()
        }

        else{
          return this.afAuth.auth.createUserWithEmailAndPassword(cadastro.emailSignup, cadastro.senhaSignup)
        }
      })
  
  }
}
