import { FireService } from './services/fire.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';


import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database'
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { LoadingModule } from 'ngx-loading';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { EstabelecimentoComponent } from './estabelecimento/estabelecimento.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { HeaderComponent } from './header/header.component';
import { AgmCoreModule } from '@agm/core';
import { AdminComponent } from './admin/admin.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminPageComponent } from './admin-page/admin-page.component';

const firebaseConfig = {
  apiKey: "AIzaSyBYUNHsD_X4yxr60N9Vjgb2kZSEQA3-Egs",
  authDomain: "tradegames-2dff6.firebaseapp.com",
  databaseURL: "https://tradegames-2dff6.firebaseio.com",
  projectId: "tradegames-2dff6",
  storageBucket: "tradegames-2dff6.appspot.com",
  messagingSenderId: "374168288805"
};


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    EstabelecimentoComponent,
    HeaderComponent,
    AdminComponent,
    AdminPageComponent
  ],
  imports: [
    BrowserModule,
    LoadingModule,
    FormsModule,
    Ng4LoadingSpinnerModule.forRoot(),
    ReactiveFormsModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AngularFireModule.initializeApp(firebaseConfig),
    RouterModule.forRoot(appRoutes),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDo1gpDFlYJzEus8c2b3aumXH8weD7YKyM'
    })
  ],
  providers: [
    FireService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
