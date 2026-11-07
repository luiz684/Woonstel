import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CondominioCompleto, Profile, SolicitacaoDetalhe, StoreService } from '../../services/store';
import { BADGE_PRIO, BADGE_STATUS, initials, primeiroNome } from '../../utils/format';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';

@Component({
  selector: 'app-sindico-inicio',
  imports: [RouterLink, BottomNavSindico],
  templateUrl: './sindico-inicio.html',
  styleUrl: './sindico-inicio.css',
})
export class SindicoInicio implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);

  perfil = signal<Profile | null>(null);
  cond = signal<CondominioCompleto | null>(null);
  carregado = signal(false);
  pendentes = signal(0);
  atencao = signal<SolicitacaoDetalhe[]>([]);

  iniciais = initials;
  primeiroNome = primeiroNome;
  badge = BADGE_STATUS;
  prio = BADGE_PRIO;

  async ngOnInit() {
    const ctx = await this.store.requireSindico();
    if (!ctx) { this.router.navigate(['/']); return; }
    this.perfil.set(ctx.perfil);
    this.cond.set(ctx.cond);

    if (ctx.cond) {
      const sols = await this.store.getSolicitacoesDoCondominio(ctx.cond.id);
      this.pendentes.set(sols.filter(s => s.status === 'Pendente').length);

    
      const peso: Record<string, number> = { Alta: 0, 'Média': 1, Baixa: 2 };
      const abertas = sols
        .filter(s => s.status !== 'Resolvida')
        .sort((a, b) =>
          (peso[a.prioridade ?? ''] ?? 3) - (peso[b.prioridade ?? ''] ?? 3) ||
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      this.atencao.set(abertas.slice(0, 3));
    }
    this.carregado.set(true);
  }
}