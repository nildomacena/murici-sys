import { FireService } from './../services/fire.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()

export class AuthGuard implements CanActivate {
  constructor(public fire: FireService, public router: Router){

  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      console.log('next',next);
      console.log('state',state);
      if(state.url == "/admin"){
          return this.fire.checaAdmin()
                    .then(result => {
                      if(result){
                        return true;
                      }
                      else{
                        this.router.navigate(['']);
                        return false;
                      }
                    });
      }
      else
        return this.fire.checaAtivo()
                  .then(ativo => {
                    if(!ativo){
                      this.fire.logout();
                      alert('Seu usuário não está ativo. Caso você já tenha realizado o pagamento, entre em contato com os administradores do sistema');
                    }
                    return Promise.resolve(ativo);

                  })
  }
}
