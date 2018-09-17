import { AdminComponent } from './admin/admin.component';
import { EstabelecimentoComponent } from './estabelecimento/estabelecimento.component';
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';


export const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'estabelecimento', component: EstabelecimentoComponent, canActivate: [AuthGuard] },
    { path: 'admin-login', component: AdminComponent},
    { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
    { path: '', component: LoginComponent },
]