import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database'
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFireAction, DatabaseSnapshot } from 'angularfire2/database/interfaces';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import * as firebase from 'firebase';

@Injectable()
export class FireService {
  providerNewUser: any;
  estabelecimento: any;
  
  constructor(public db: AngularFireDatabase, public afAuth: AngularFireAuth, public storage: AngularFireStorage ) {
    this.afAuth.authState.subscribe(user => {
      console.log(user);
      if(user.uid)
        this.db.list('estabelecimentos', ref => ref.orderByChild('uid').equalTo(user.uid))
          .snapshotChanges().first().toPromise().then((result => {
            this.estabelecimento = this.snapshotParaValue(result)[0];
            console.log(this.estabelecimento);
          }))
    })
  }

  checaAdmin(uid):Promise<any>{
    return this.db.list('estabelecimentos', ref => ref.orderByChild('uid').equalTo(uid))
              .valueChanges().first().toPromise().then(value => {
                return Promise.resolve(value[0]['admin']);
              })
  }

  getEstabelecimentoById(uid){
    return this.db.list('estabelecimentos', ref => ref.orderByChild('uid').equalTo(uid))
              .snapshotChanges().first().toPromise().then(snap => {
                return Promise.resolve(this.snapshotParaValue(snap)[0]);
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

  facebook(){
    this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
      .then(result => {
        console.log(result);
      })
  }
  
  cadastrarUsuario(cadastro: any):Promise<any>{
    return this.afAuth.auth.fetchProvidersForEmail(cadastro.emailSignup)
      .then(result => {
        if(result.length > 0 && result[0] == 'facebook.com'){
          alert('Como você já tem uma conta criada com o login do Facebook, é necessário que faça o login nesse site para continuar.\nLibere as popups para fazer login com o Facebook ou use um email diferente.');
          this.providerNewUser = firebase.auth.EmailAuthProvider.credential(cadastro.emailSignup, cadastro.senhaSignup);
          return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
            .then(resultSignIn => {
              return this.afAuth.auth.currentUser.linkWithCredential(this.providerNewUser);
            })
        }
        else if(result.length > 0 && result[1] == 'facebook.com'){
          alert('Como você já tem uma conta criada com o login do Facebook, é necessário que faça o login nesse site para continuar.\nLibere as popups para fazer login com o Facebook ou use um email diferente.');
          this.providerNewUser = firebase.auth.EmailAuthProvider.credential(cadastro.emailSignup, cadastro.senhaSignup);
          return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
            .then(resultSignIn => {
              return this.afAuth.auth.currentUser.linkWithCredential(this.providerNewUser);
            })
        }

        else{
          return this.afAuth.auth.createUserWithEmailAndPassword(cadastro.emailSignup, cadastro.senhaSignup)
        }
      })
  
  }
  updateDDadosEstabelecimento(estabelecimento):Promise<any>{
    console.log(estabelecimento);
    return this.db.object(`estabelecimentos/${this.estabelecimento.key}`).update(estabelecimento);
  }

  salvarDadosUsuário(cadastro: any){
    return this.db.list('estabelecimentos').push({
      categoria: cadastro.categoria, 
      nome: cadastro.nomeEstabelecimento,
      ativo: false,
      nomeResponsavel: cadastro.nome,
      uid: this.afAuth.auth.currentUser.uid,
    });
  }
  salvarEndereco(coords:any):Promise<any>{
    return this.db.object(`estabelecimentos/${this.estabelecimento.key}/coords`).update(coords);
  }
  salvarImagens(avatar, imagemAdicional?):Promise<any>{
    let urlAvatar: string;
    let urlAdicional: string;

    if(imagemAdicional && avatar){
      return this.storage.ref(this.estabelecimento.key+'/avatar.jpg').put(avatar)
        .then(resultAvatar => {
          console.log(resultAvatar);
          urlAvatar = resultAvatar.downloadURL;
          return this.storage.ref(this.estabelecimento.key+'/imagemAdicional.jpg').put(imagemAdicional)
            .then(resultAdicional => {
              urlAdicional = resultAdicional.downloadURL;
              return this.db.object(`estabelecimentos/${this.estabelecimento.key}`).update({avatar: urlAvatar, imagemAdicional: urlAdicional});
            })
        })
    }
    else if(avatar)
      return this.storage.ref(this.estabelecimento.key+'/avatar.jpg').put(avatar)
        .then(result => {
          console.log(result);
          return this.db.object(`estabelecimentos/${this.estabelecimento.key}`).update({avatar: result.downloadURL});
        })
    else if(imagemAdicional)
      return this.storage.ref(this.estabelecimento.key+'/imagemAdicional.jpg').put(imagemAdicional)
        .then(result => {
          console.log(result);
          return this.db.object(`estabelecimentos/${this.estabelecimento.key}`).update({imagemAdicional: result.downloadURL});
        })
  }

  login(user){
    return this.afAuth.auth.signInWithEmailAndPassword(user.email, user.senha);
  }
  logout(){
    this.afAuth.auth.signOut();
  }


  enviarNotificacao(corpo){
    //firebase.messaging().
  }
}
