import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { CriarConta } from './pages/criar-conta/criar-conta';
import { EsqueciSenha } from './pages/esqueci-senha/esqueci-senha';
import { MoradorInicio } from './pages/morador-inicio/morador-inicio';

import { MoradorMinhasSolicitacoes } from './pages/morador-minhas-solicitacoes/morador-minhas-solicitacoes';
import { MoradorSolicitacaoDetalhe } from './pages/morador-solicitacao-detalhe/morador-solicitacao-detalhe';
import { MoradorSolicitarManutencao } from './pages/morador-solicitar-manutencao/morador-solicitar-manutencao';
import { MoradorReservas } from './pages/morador-reservas/morador-reservas';
import { MoradorReservarArea } from './pages/morador-reservar-area/morador-reservar-area';
import { MoradorPerfil } from './pages/morador-perfil/morador-perfil';
import { SindicoInicio } from './pages/sindico-inicio/sindico-inicio';
import { SindicoCadastrarCondominio } from './pages/sindico-cadastrar-condominio/sindico-cadastrar-condominio';
import { SindicoSolicitacoes } from './pages/sindico-solicitacoes/sindico-solicitacoes';
import { SindicoSolicitacaoDetalhe } from './pages/sindico-solicitacao-detalhe/sindico-solicitacao-detalhe';
import { SindicoMoradores } from './pages/sindico-moradores/sindico-moradores';
import { SindicoReservar } from './pages/sindico-reservar/sindico-reservar';
import { SindicoAvisos } from './pages/sindico-avisos/sindico-avisos';
import { SindicoPerfil } from './pages/sindico-perfil/sindico-perfil';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'criar-conta', component: CriarConta },
  { path: 'esqueci-senha', component: EsqueciSenha },

  { path: 'morador/inicio', component: MoradorInicio },
  { path: 'morador/minhas-solicitacoes', component: MoradorMinhasSolicitacoes },
  { path: 'morador/solicitacao/:id', component: MoradorSolicitacaoDetalhe },
  { path: 'morador/solicitar-manutencao', component: MoradorSolicitarManutencao },
  { path: 'morador/reservas', component: MoradorReservas },
  { path: 'morador/reservar-area', component: MoradorReservarArea },
  { path: 'morador/perfil', component: MoradorPerfil },

  { path: 'sindico/inicio', component: SindicoInicio },
  { path: 'sindico/cadastrar-condominio', component: SindicoCadastrarCondominio },
  { path: 'sindico/solicitacoes', component: SindicoSolicitacoes },
  { path: 'sindico/solicitacao/:id', component: SindicoSolicitacaoDetalhe },
  { path: 'sindico/moradores', component: SindicoMoradores },
  { path: 'sindico/reservar', component: SindicoReservar },
  { path: 'sindico/avisos', component: SindicoAvisos },
  { path: 'sindico/perfil', component: SindicoPerfil },

  { path: 'sindico/solicitacoes', component: SindicoSolicitacoes },
  { path: 'sindico/solicitacao/:id', component: SindicoSolicitacaoDetalhe },
  { path: 'sindico/moradores', component: SindicoMoradores },
  { path: 'sindico/reservar', component: SindicoReservar },
  { path: 'sindico/avisos', component: SindicoAvisos },
  { path: 'sindico/perfil', component: SindicoPerfil },

  { path: '**', redirectTo: '' },
];