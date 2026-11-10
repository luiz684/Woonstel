import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SolicitacaoDetalhe, StoreService } from '../../services/store';
import { BADGE_STATUS, FILTROS_SOLICITACAO, formatDateBR, solicitacaoNoFiltro } from '../../utils/format';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';
import { FiltroChips } from '../../components/filtro-chips/filtro-chips';

@Component({
  selector: 'app-sindico-solicitacoes',
  imports: [RouterLink, BottomNavSindico, FiltroChips],
  templateUrl: './sindico-solicitacoes.html',
  styleUrl: './sindico-solicitacoes.css',
})
export class SindicoSolicitacoes implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);

  todas = signal<SolicitacaoDetalhe[]>([]);
  filtro = signal('Em aberto');
  badge = BADGE_STATUS;
  data = formatDateBR;

  opcoes = computed(() =>
    FILTROS_SOLICITACAO.map(valor => ({
      valor,
      qtd: this.todas().filter(s => solicitacaoNoFiltro(s.status, valor)).length,
    })));

  lista = computed(() => {
    const f = this.filtro();
    const itens = this.todas().filter(s => solicitacaoNoFiltro(s.status, f));
    if (f !== 'Em aberto') return itens;

    const peso: Record<string, number> = { Alta: 0, 'Média': 1, Baixa: 2 };
    return [...itens].sort((a, b) =>
      (peso[a.prioridade ?? ''] ?? 3) - (peso[b.prioridade ?? ''] ?? 3) ||
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  });

  async ngOnInit() {
    const ctx = await this.store.requireSindico();
    if (!ctx) { this.router.navigate(['/']); return; }
    if (!ctx.cond) { this.router.navigate(['/sindico/cadastrar-condominio']); return; }
    this.todas.set(await this.store.getSolicitacoesDoCondominio(ctx.cond.id));
  }
}