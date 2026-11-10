import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SolicitacaoDetalhe, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { BADGE_PRIO, BADGE_STATUS, formatDateBR } from '../../utils/format';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';

type Prio = 'Baixa' | 'Média' | 'Alta';

@Component({
  selector: 'app-sindico-solicitacao-detalhe',
  imports: [FormsModule, RouterLink, BottomNavSindico],
  templateUrl: './sindico-solicitacao-detalhe.html',
  styleUrl: './sindico-solicitacao-detalhe.css',
})
export class SindicoSolicitacaoDetalhe implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  s = signal<SolicitacaoDetalhe | null>(null);
  fotoUrl = signal<string | null>(null);
  fotoErro = signal(false);
  carregado = signal(false);
  salvando = signal(false);
  enviando = signal(false);
  prioridadeNova = signal<Prio | null>(null);

  prioridades: Prio[] = ['Baixa', 'Média', 'Alta'];
  resposta = '';
  badge = BADGE_STATUS;
  prio = BADGE_PRIO;
  data = formatDateBR;

  get podeMudarPrioridade(): boolean {
    return this.s()?.status === 'Pendente';
  }

  get podeResponder(): boolean {
    const st = this.s()?.status;
    return !!st && st !== 'Resolvida';
  }

  async ngOnInit() {
    const ctx = await this.store.requireSindico();
    if (!ctx) { this.router.navigate(['/']); return; }
    await this.carregar();
  }

  private async carregar() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    const sol = await this.store.getSolicitacao(id);
    this.s.set(sol);
    if (sol?.foto_path) {
      const url = await this.store.getFotoUrl(sol.foto_path);
      this.fotoUrl.set(url);
      this.fotoErro.set(!url);
    }
    this.carregado.set(true);
  }

  async mudarStatus(novo: 'Em andamento' | 'Resolvida') {
    const sol = this.s();
    if (!sol) return;
    this.salvando.set(true);
    const { data, error } = await this.store.atualizarStatusSolicitacao(sol, novo);
    this.salvando.set(false);
    if (error || !data || data.length === 0) {
      this.toast.show(error?.message ?? 'Não foi possível atualizar o status.');
      return;
    }
    this.prioridadeNova.set(null);
    this.toast.show('Status atualizado! O morador será avisado.');
    await this.carregar();
  }

  escolherPrioridade(p: Prio) {
    const sol = this.s();
    if (!sol || !this.podeMudarPrioridade) return;
    this.prioridadeNova.set(sol.prioridade === p ? null : p);
  }

  async confirmarPrioridade() {
    const sol = this.s();
    const nova = this.prioridadeNova();
    if (!sol || !nova) return;

    this.salvando.set(true);
    const { data, error } = await this.store.atualizarPrioridade(sol, nova);
    this.salvando.set(false);
    if (error || !data || data.length === 0) {
      this.toast.show(error?.message ?? 'Não foi possível alterar a prioridade.');
      return;
    }
    this.prioridadeNova.set(null);
    this.toast.show('Prioridade atualizada.');
    await this.carregar();
  }

  async enviarResposta() {
    const sol = this.s();
    const texto = this.resposta.trim();
    if (!sol) return;
    if (texto.length < 3) { this.toast.show('Escreva a resposta ao morador.'); return; }

    this.enviando.set(true);
    const { data, error } = await this.store.responderSolicitacao(sol, texto);
    this.enviando.set(false);
    if (error || !data || data.length === 0) {
      this.toast.show(error?.message ?? 'Não foi possível enviar a resposta.');
      return;
    }
    this.resposta = '';
    this.toast.show('Resposta enviada ao morador.');
    await this.carregar();
  }
}