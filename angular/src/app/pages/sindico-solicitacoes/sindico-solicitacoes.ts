import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SolicitacaoDetalhe, StoreService } from '../../services/store';
import { BADGE_STATUS, formatDateBR } from '../../utils/format';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';

@Component({
  selector: 'app-sindico-solicitacoes',
  imports: [RouterLink, BottomNavSindico],
  templateUrl: './sindico-solicitacoes.html',
  styleUrl: './sindico-solicitacoes.css',
})
export class SindicoSolicitacoes implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);

  todas = signal<SolicitacaoDetalhe[]>([]);
  filtros = ['Todas', 'Pendente', 'Em andamento', 'Resolvida'];
  filtro = signal('Todas');
  badge = BADGE_STATUS;
  data = formatDateBR;

  lista = computed(() =>
    this.filtro() === 'Todas' ? this.todas() : this.todas().filter(s => s.status === this.filtro()));

  async ngOnInit() {
    const ctx = await this.store.requireSindico();
    if (!ctx) { this.router.navigate(['/']); return; }
    if (!ctx.cond) { this.router.navigate(['/sindico/cadastrar-condominio']); return; }
    this.todas.set(await this.store.getSolicitacoesDoCondominio(ctx.cond.id));
  }
}