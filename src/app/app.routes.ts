import { EstabelecimentoComponent } from './estabelecimento/estabelecimento.component';
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';


export const appRoutes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'estabelecimento', component: EstabelecimentoComponent},
    {path: '', component: LoginComponent},
]