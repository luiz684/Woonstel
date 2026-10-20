import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SolicitacaoDetalhe, StoreService } from '../../services/store';
import { BADGE_STATUS, formatDateBR } from '../../utils/format';
import { BottomNavMorador } from '../../components/bottom-nav-morador/bottom-nav-morador';

@Component({
  selector: 'app-morador-minhas-solicitacoes',
  imports: [RouterLink, BottomNavMorador],
  templateUrl: './morador-minhas-solicitacoes.html',
  styleUrl: './morador-minhas-solicitacoes.css',
})
export class MoradorMinhasSolicitacoes implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);

  todas = signal<SolicitacaoDetalhe[]>([]);
  busca = signal('');
  badge = BADGE_STATUS;
  data = formatDateBR;

  lista = computed(() => {
    const b = this.busca().toLowerCase();
    if (!b) return this.todas();
    return this.todas().filter(s =>
      s.titulo.toLowerCase().includes(b) || (s.categoria ?? '').toLowerCase().includes(b));
  });

  async ngOnInit() {
    const p = await this.store.requireProfile('condomino');
    if (!p) { this.router.navigate(['/']); return; }
    this.todas.set(await this.store.getSolicitacoesByMorador(p.id));
  }

  onBusca(e: Event) {
    this.busca.set((e.target as HTMLInputElement).value);
  }
}