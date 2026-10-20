import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SolicitacaoDetalhe, StoreService } from '../../services/store';
import { BADGE_PRIO, BADGE_STATUS, formatDateBR } from '../../utils/format';

@Component({
  selector: 'app-morador-solicitacao-detalhe',
  imports: [RouterLink],
  templateUrl: './morador-solicitacao-detalhe.html',
  styleUrl: './morador-solicitacao-detalhe.css',
})
export class MoradorSolicitacaoDetalhe implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  s = signal<SolicitacaoDetalhe | null>(null);
  carregado = signal(false);
  badge = BADGE_STATUS;
  prio = BADGE_PRIO;
  data = formatDateBR;

  async ngOnInit() {
    const p = await this.store.requireProfile('condomino');
    if (!p) { this.router.navigate(['/']); return; }

    const id = this.route.snapshot.paramMap.get('id') ?? '';
    const s = await this.store.getSolicitacao(id);
    this.s.set(s && s.morador_id === p.id ? s : null);
    this.carregado.set(true);
  }
}