import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { CriarConta } from './pages/criar-conta/criar-conta';
import { EsqueciSenha } from './pages/esqueci-senha/esqueci-senha';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'criar-conta', component: CriarConta },
  { path: 'esqueci-senha', component: EsqueciSenha },
  { path: '**', redirectTo: '' },
];