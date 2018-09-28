import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database'
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFireAction, DatabaseSnapshot } from 'angularfire2/database/interfaces';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import * as firebase from 'firebase';
import { ThenableReference } from '@firebase/database-types';

declare var Materialize: any;

@Injectable()
export class FireService {
  providerNewUser: any;
  estabelecimento: any;

  constructor(public db: AngularFireDatabase, public afAuth: AngularFireAuth, public storage: AngularFireStorage) {
    this.afAuth.authState.subscribe(user => {
      if (user.uid) {
        this.db.list('estabelecimentos', ref => ref.orderByChild('uid').equalTo(user.uid))
          .snapshotChanges().first().toPromise().then((result => {
            this.estabelecimento = this.snapshotParaValue(result)[0];
          }));
      }
    })
  }

  checaAdmin(uid?: any): Promise<any> {
    return this.afAuth.authState.delay(2000).first().toPromise().then(user => {
      if (user) {
        return this.db.list('estabelecimentos', ref => ref.orderByChild('uid').equalTo(uid ? uid : this.afAuth.auth.currentUser.uid))
          .valueChanges().delay(2000).first().toPromise().then(value => {
            return Promise.resolve(value[0]['admin']);
          });
      }
      else
        return Promise.resolve(false);
    });
  }

  checaAtivo(uid?: any): Promise<any> {
    return this.afAuth.authState.delay(2000).first().toPromise().then(user => {
      if (user) {
        return this.db.list('estabelecimentos', ref => ref.orderByChild('uid').equalTo(uid ? uid : this.afAuth.auth.currentUser.uid))
          .valueChanges().delay(2000).first().toPromise().then(value => {
            return Promise.resolve(value[0]['ativo']);
          });
      }
      else
        return Promise.resolve(false);
    });
  }

  getEstabelecimentos() {
    return this.db.list('estabelecimentos', ref => ref.orderByChild('ativo').equalTo(true))
      .snapshotChanges().first().toPromise().then(snap => {
        return Promise.resolve(this.snapshotParaValue(snap));
      })
  }

  getDestaques(){
    return this.db.list('destaques')
      .snapshotChanges().first().toPromise().then(snap => {
        if(snap.length > 0)
          return Promise.resolve(this.snapshotParaValue(snap));
        else  
          return Promise.resolve(null);
      })
  }

  removerDestaque(estabelecimento){
    return this.db.list(`destaques/${estabelecimento.key}`).remove();
  }

  colocarEmDestaque(estabelecimento):Promise<any>{
    return this.db.list(`destaques/${estabelecimento.key}`).set('estabelecimento',estabelecimento);
  }
  deletarSorteio(sorteio): Promise<void> {
    return this.storage.ref(`sorteios/${sorteio.key}`).delete().first().toPromise()
      .then(_ => {
        return this.db.object(`sorteios/${sorteio.key}`).remove()
      })
  }
  getSorteios(): Promise<any> {
    return this.db.list('sorteios').snapshotChanges().first().toPromise()
      .then(snap => {
        if (snap.length > 0)
          return Promise.resolve(this.snapshotParaValue(snap))
        else
          return Promise.resolve([]);
      })
  }

  realizarSorteio(sorteio): Promise<any> {
    return this.db.object(`sorteios/${sorteio.key}`).update({ sortear: true });
  }

  getEstabelecimentoByUid(uid) {
    return this.db.list('estabelecimentos', ref => ref.orderByChild('uid').equalTo(uid))
      .snapshotChanges().first().toPromise().then(snap => {
        return Promise.resolve(this.snapshotParaValue(snap)[0]);
      })
  }

  habilitarEstabelecimento(estabelecimento: any, habilitar: boolean) {
    return this.db.object(`estabelecimentos/${estabelecimento.key}`).update({ ativo: habilitar, categoriaAtivo: estabelecimento.categoria + "_" + habilitar });
  }
  getEstabelecimentoByKey(key) {
    return this.db.object(`estabelecimentos/${key}`)
      .snapshotChanges().first().toPromise().then(estabelecimento => {
        return Promise.resolve(this.snapshotParaValue(estabelecimento));
      })
  }

  getEstabelecimentosPorCategoria(categoria) {
    return this.db.list('estabelecimentos', ref => ref.orderByChild('categoria').equalTo(categoria))
      .snapshotChanges().first().toPromise().then(snap => {
        console.log(snap);
        if (snap.length == 0)
          return [];
        return Promise.resolve(this.snapshotParaValue(snap));
      })
  }

  cadastrarEstabelecimento(estabelecimento: any): Promise<any> {
    estabelecimento['ativado'] = false;
    return this.db.list('estabelecimentos', ref => ref.orderByChild('email').equalTo(estabelecimento.email))
      .valueChanges().first().toPromise().then(value => {
        if (value.length > 0)
          return Promise.reject('email já cadastrado');
        else
          return this.db.list('estabelecimentos').push(estabelecimento)
            .then(_ => {
              return Promise.resolve(true);
            })
      })
  }

  getCategorias(): Promise<any> {
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

  salvarSorteio(sorteio: any) {
    sorteio['pendente'] = true;
    sorteio['ganhador'] = {};
    return this.db.list('sorteios').push(sorteio);
  }

  salvarImagemSorteio(imagem, key): Promise<any> {
    return this.storage.ref(`sorteios/${key}`).put(imagem)
      .then(dados => {
        return this.db.object(`sorteios/${key}`).update({ imagem: dados.downloadURL });
      })
  }

  snapshotParaValue(snapshot): any {
    console.log('snapshot', snapshot)
    let novaLista = [];
    if (snapshot.length > 0) {
      snapshot.map(objeto => {
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
    else {
      console.log(snapshot);
      let novoObjeto = {};
      novoObjeto['key'] = snapshot.key;
      let val = snapshot.payload.val();
      Object.keys(val).map(key => {
        novoObjeto[key] = val[key]
      });
      console.log('novo objeto', novoObjeto)
      return novoObjeto;
    }
  }

  estabelecimentosAtivos(estabelecimentos: any[]) {
    let ativos: any[] = []
    estabelecimentos.map(estabelecimento => {
      if (estabelecimento.ativado)
        ativos.push(estabelecimento);
    })
    return ativos;
  }

  facebook() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
      .then(result => {
        console.log(result);
      })
  }

  cadastrarUsuario(cadastro: any): Promise<any> {
    return this.afAuth.auth.fetchProvidersForEmail(cadastro.emailSignup)
      .then(result => {
        if (result.length > 0 && result[0] == 'facebook.com') {
          alert('Como você já tem uma conta criada com o login do Facebook, é necessário que faça o login nesse site para continuar.\nLibere as popups para fazer login com o Facebook ou use um email diferente.');
          this.providerNewUser = firebase.auth.EmailAuthProvider.credential(cadastro.emailSignup, cadastro.senhaSignup);
          return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
            .then(resultSignIn => {
              return this.afAuth.auth.currentUser.linkWithCredential(this.providerNewUser);
            })
        }
        else if (result.length > 0 && result[1] == 'facebook.com') {
          alert('Como você já tem uma conta criada com o login do Facebook, é necessário que faça o login nesse site para continuar.\nLibere as popups para fazer login com o Facebook ou use um email diferente.');
          this.providerNewUser = firebase.auth.EmailAuthProvider.credential(cadastro.emailSignup, cadastro.senhaSignup);
          return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider())
            .then(resultSignIn => {
              return this.afAuth.auth.currentUser.linkWithCredential(this.providerNewUser);
            })
        }

        else {
          return this.afAuth.auth.createUserWithEmailAndPassword(cadastro.emailSignup, cadastro.senhaSignup)
        }
      })

  }
  updateDadosEstabelecimento(estabelecimento): Promise<any> {
    console.log(estabelecimento);
    return this.db.object(`estabelecimentos/${estabelecimento.key}`).update(estabelecimento);
  }

  salvarDadosUsuário(cadastro: any) {
    return this.db.list('estabelecimentos').push({
      categoria: cadastro.categoria,
      nome: cadastro.nomeEstabelecimento,
      ativo: false,
      nomeResponsavel: cadastro.nome,
      tags: [],
      avatar: 'https://firebasestorage.googleapis.com/v0/b/tradegames-2dff6.appspot.com/o/no-photo-available-300x225.png?alt=media&token=5d3303c5-528f-44ec-9f2c-02489cf488b2',
      uid: this.afAuth.auth.currentUser.uid,
    });
  }
  salvarEndereco(coords: any): Promise<any> {
    return this.db.object(`estabelecimentos/${this.estabelecimento.key}/coords`).update(coords);
  }

  habilitarImagemAdicional(estabelecimentoKey: any, imagensAdicionais: any): Promise<any> {
    return this.db.object(`estabelecimentos/${estabelecimentoKey}/imagensAdicionais`).set(imagensAdicionais);
  }

  salvarImagem(imagem:string, arquivo:any){

  }

  salvarImagens(avatar, imagemAdicional?, imagemAdicional_2?, key?:any): Promise<any> {
    let estabelecimentoKey: string;
    if(key)
      estabelecimentoKey = key;
    
    else  
      estabelecimentoKey = this.estabelecimento.key;
    console.log(`avatar: ${avatar},imagemAdicional: ${imagemAdicional},imagemAdicional_2: ${imagemAdicional_2}`)
    let urlAvatar: string;
    let urlAdicional: string;

    if (imagemAdicional && avatar && imagemAdicional_2)
      return this.storage.ref(estabelecimentoKey + '/avatar.jpg').put(avatar)
        .then(resultAvatar => {
          console.log(resultAvatar);
          urlAvatar = resultAvatar.downloadURL;
          return this.storage.ref(estabelecimentoKey + '/imagemAdicional.jpg').put(imagemAdicional)
            .then(resultAdicional => {
              urlAdicional = resultAdicional.downloadURL;
              return this.storage.ref(estabelecimentoKey + '/imagemAdicional2.jpg').put(imagemAdicional_2)
                .then(resultAdicional2 => {
                  let urlAdicional2 = resultAdicional2.downloadURL;
                  return this.db.object(`estabelecimentos/${estabelecimentoKey}`).update({ avatar: urlAvatar, imagemAdicional: urlAdicional, imagemAdicional2: urlAdicional2 });
                })
            })
        })

    else if (imagemAdicional && avatar && !imagemAdicional_2) {
      return this.storage.ref(estabelecimentoKey + '/avatar.jpg').put(avatar)
        .then(resultAvatar => {
          console.log(resultAvatar);
          urlAvatar = resultAvatar.downloadURL;
          return this.storage.ref(estabelecimentoKey + '/imagemAdicional.jpg').put(imagemAdicional)
            .then(resultAdicional => {
              urlAdicional = resultAdicional.downloadURL;
              return this.db.object(`estabelecimentos/${estabelecimentoKey}`).update({ avatar: urlAvatar, imagemAdicional: urlAdicional });
            })
        })
    }

    else if (imagemAdicional && !avatar && imagemAdicional_2)
      return this.storage.ref(estabelecimentoKey + '/imagemAdicional.jpg').put(imagemAdicional)
        .then(resultAdicional => {
          urlAdicional = resultAdicional.downloadURL;
          return this.storage.ref(estabelecimentoKey + '/imagemAdicional.jpg').put(imagemAdicional)
            .then(resultAdicional2 => {
              let urlAdicional2 = resultAdicional2.downloadURL;
              return this.db.object(`estabelecimentos/${estabelecimentoKey}`).update({ imagemAdicional: urlAdicional, imagemAdicional2: urlAdicional2 });
            })
        })

    else if (!imagemAdicional && avatar && imagemAdicional_2)
      return this.storage.ref(estabelecimentoKey + '/avatar.jpg').put(avatar)
        .then(resultAvatar => {
          console.log(resultAvatar);
          urlAvatar = resultAvatar.downloadURL;
          return this.storage.ref(estabelecimentoKey + '/imagemAdicional.jpg').put(imagemAdicional)
            .then(resultAdicional2 => {
              let urlAdicional2 = resultAdicional2.downloadURL;
              return this.db.object(`estabelecimentos/${estabelecimentoKey}`).update({ avatar: urlAvatar, imagemAdicional2: urlAdicional2 });
            })
        })

    else if (avatar)
      return this.storage.ref(estabelecimentoKey + '/avatar.jpg').put(avatar)
        .then(result => {
          console.log(result);
          return this.db.object(`estabelecimentos/${estabelecimentoKey}`).update({ avatar: result.downloadURL });
        })
    else if (imagemAdicional)
      return this.storage.ref(estabelecimentoKey + '/imagemAdicional.jpg').put(imagemAdicional)
        .then(result => {
          console.log(result);
          return this.db.object(`estabelecimentos/${estabelecimentoKey}`).update({ imagemAdicional: result.downloadURL });
        });
    else if (imagemAdicional_2)
      return this.storage.ref(estabelecimentoKey + '/imagemAdicional_2.jpg').put(imagemAdicional_2)
        .then(result => {
          console.log(result);
          return this.db.object(`estabelecimentos/${estabelecimentoKey}`).update({ imagemAdicional_2: result.downloadURL });
        });


  }

  login(user) {
    return this.afAuth.auth.signInWithEmailAndPassword(user.email, user.senha);
  }
  logout() {
    this.afAuth.auth.signOut();
  }


  enviarNotificacao(titulo, corpo, estabelecimento): ThenableReference {
    return this.db.list('notificacoes').push({ titulo: titulo, corpo: corpo, estabelecimento: estabelecimento });
  }


  toast(mensagem: string, duracao?: number) {
    Materialize.toast(mensagem, 3000)
  }
}