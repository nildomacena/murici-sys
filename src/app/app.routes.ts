import { AdminComponent } from './admin/admin.component';
import { EstabelecimentoComponent } from './estabelecimento/estabelecimento.component';
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';


export const appRoutes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'estabelecimento', component: EstabelecimentoComponent},
    {path: 'admin', component: AdminComponent},
    {path: '', component: LoginComponent},
]