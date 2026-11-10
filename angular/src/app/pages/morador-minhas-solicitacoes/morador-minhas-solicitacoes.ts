import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SolicitacaoDetalhe, StoreService } from '../../services/store';
import { BADGE_STATUS, FILTROS_SOLICITACAO, formatDateBR, solicitacaoNoFiltro } from '../../utils/format';
import { BottomNavMorador } from '../../components/bottom-nav-morador/bottom-nav-morador';
import { FiltroChips } from '../../components/filtro-chips/filtro-chips';

@Component({
  selector: 'app-morador-minhas-solicitacoes',
  imports: [RouterLink, BottomNavMorador, FiltroChips],
  templateUrl: './morador-minhas-solicitacoes.html',
  styleUrl: './morador-minhas-solicitacoes.css',
})
export class MoradorMinhasSolicitacoes implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);

  todas = signal<SolicitacaoDetalhe[]>([]);
  busca = signal('');
  filtro = signal('Em aberto');
  mostrarFiltros = signal(true);
  badge = BADGE_STATUS;
  data = formatDateBR;

  opcoes = computed(() =>
    FILTROS_SOLICITACAO.map(valor => ({
      valor,
      qtd: this.todas().filter(s => solicitacaoNoFiltro(s.status, valor)).length,
    })));

  lista = computed(() => {
    const b = this.busca().toLowerCase();
    return this.todas().filter(s =>
      solicitacaoNoFiltro(s.status, this.filtro()) &&
      (!b || s.titulo.toLowerCase().includes(b) || (s.categoria ?? '').toLowerCase().includes(b)));
  });

  async ngOnInit() {
    const p = await this.store.requireProfile('condomino');
    if (!p) { this.router.navigate(['/']); return; }
    this.todas.set(await this.store.getSolicitacoesDoMorador(p.id));
  }

  onBusca(e: Event) {
    this.busca.set((e.target as HTMLInputElement).value);
  }
}