import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { CriarConta } from './pages/criar-conta/criar-conta';
import { EsqueciSenha } from './pages/esqueci-senha/esqueci-senha';
import { MoradorInicio } from './pages/morador-inicio/morador-inicio';
import { SindicoInicio } from './pages/sindico-inicio/sindico-inicio';
import { SindicoCadastrarCondominio } from './pages/sindico-cadastrar-condominio/sindico-cadastrar-condominio';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'criar-conta', component: CriarConta },
  { path: 'esqueci-senha', component: EsqueciSenha },
  { path: 'morador/inicio', component: MoradorInicio },
  { path: 'sindico/inicio', component: SindicoInicio },
  { path: 'sindico/cadastrar-condominio', component: SindicoCadastrarCondominio },
  { path: '**', redirectTo: '' },
];