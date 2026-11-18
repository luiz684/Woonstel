import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { EsqueciSenha } from './pages/esqueci-senha/esqueci-senha';
import { MoradorInicio } from './pages/morador-inicio/morador-inicio';
import { MoradorMinhasSolicitacoes } from './pages/morador-minhas-solicitacoes/morador-minhas-solicitacoes';
import { MoradorSolicitacaoDetalhe } from './pages/morador-solicitacao-detalhe/morador-solicitacao-detalhe';
import { MoradorSolicitarManutencao } from './pages/morador-solicitar-manutencao/morador-solicitar-manutencao';
import { MoradorReservas } from './pages/morador-reservas/morador-reservas';
import { MoradorReservarArea } from './pages/morador-reservar-area/morador-reservar-area';
import { SindicoInicio } from './pages/sindico-inicio/sindico-inicio';
import { SindicoCadastrarCondominio } from './pages/sindico-cadastrar-condominio/sindico-cadastrar-condominio';
import { SindicoSolicitacoes } from './pages/sindico-solicitacoes/sindico-solicitacoes';
import { SindicoSolicitacaoDetalhe } from './pages/sindico-solicitacao-detalhe/sindico-solicitacao-detalhe';
import { SindicoMoradores } from './pages/sindico-moradores/sindico-moradores';
import { SindicoReservas } from './pages/sindico-reservas/sindico-reservas';
import { SindicoAvisos } from './pages/sindico-avisos/sindico-avisos';
import { SindicoAreas } from './pages/sindico-areas/sindico-areas';
import { SindicoDashboard } from './pages/sindico-dashboard/sindico-dashboard';
import { MoradorAvisos } from './pages/morador-avisos/morador-avisos';
import { MoradorNotificacoes } from './pages/morador-notificacoes/morador-notificacoes';
import { Convite } from './pages/convite/convite';
import { Perfil } from './pages/perfil/perfil';




export const routes: Routes = [
  { path: '', component: Login },
  { path: 'esqueci-senha', component: EsqueciSenha },
  { path: 'morador/inicio', component: MoradorInicio },
  { path: 'morador/minhas-solicitacoes', component: MoradorMinhasSolicitacoes },
  { path: 'morador/solicitacao/:id', component: MoradorSolicitacaoDetalhe },
  { path: 'morador/solicitar-manutencao', component: MoradorSolicitarManutencao },
  { path: 'morador/reservas', component: MoradorReservas },
  { path: 'morador/reservar-area', component: MoradorReservarArea },
  { path: 'sindico/inicio', component: SindicoInicio },
  { path: 'sindico/cadastrar-condominio', component: SindicoCadastrarCondominio },
  { path: 'sindico/solicitacoes', component: SindicoSolicitacoes },
  { path: 'sindico/solicitacao/:id', component: SindicoSolicitacaoDetalhe },
  { path: 'sindico/moradores', component: SindicoMoradores },
  { path: 'sindico/reservas', component: SindicoReservas },
  { path: 'sindico/avisos', component: SindicoAvisos },
  { path: 'sindico/solicitacoes', component: SindicoSolicitacoes },
  { path: 'sindico/solicitacao/:id', component: SindicoSolicitacaoDetalhe },
  { path: 'sindico/moradores', component: SindicoMoradores },
  { path: 'sindico/avisos', component: SindicoAvisos },
  { path: 'sindico/areas', component: SindicoAreas },
  { path: 'sindico/dashboard', component: SindicoDashboard },
  { path: 'morador/avisos', component: MoradorAvisos },
  { path: 'morador/notificacoes', component: MoradorNotificacoes },
  { path: 'convite/:token', component: Convite },
  { path: 'morador/perfil', component: Perfil, data: { tipo: 'condomino' } },
  { path: 'morador/perfil/:secao', component: Perfil, data: { tipo: 'condomino' } },
  { path: 'sindico/perfil', component: Perfil, data: { tipo: 'sindico' } },
  { path: 'sindico/perfil/:secao', component: Perfil, data: { tipo: 'sindico' } },
  { path: '**', redirectTo: '' },
];