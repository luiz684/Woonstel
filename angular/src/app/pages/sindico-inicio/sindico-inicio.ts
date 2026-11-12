import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CondominioCompleto, Profile, SolicitacaoDetalhe, StoreService } from '../../services/store';
import { BADGE_PRIO, BADGE_STATUS, initials, primeiroNome, solicitacaoAberta } from '../../utils/format';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';
import { Avatar } from '../../components/avatar/avatar';

interface Card {
  rota: string;
  rotulo: string;
  icone: string;
  comBadge?: boolean;
}

@Component({
  selector: 'app-sindico-inicio',
  imports: [RouterLink, BottomNavSindico, Avatar],
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

  cards: Card[] = [
    { rota: '/sindico/solicitacoes', rotulo: 'Solicitações', comBadge: true,
      icone: 'M9 5h6M9 3v4M4 8h16v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8z' },
    { rota: '/sindico/moradores', rotulo: 'Moradores',
      icone: 'M9 4.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6M18 6.4a2.6 2.6 0 100 5.2 2.6 2.6 0 000-5.2zM15.8 14.2c2.5.4 4.7 2.4 4.7 5.3' },
    { rota: '/sindico/reservas', rotulo: 'Reservas de área',
      icone: 'M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2zM3 10h18M8 3v4M16 3v4' },
    { rota: '/sindico/areas', rotulo: 'Áreas comuns',
      icone: 'M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6' },
    { rota: '/sindico/avisos', rotulo: 'Avisos',
      icone: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0' },
    { rota: '/sindico/cadastrar-condominio', rotulo: 'Dados do condomínio',
      icone: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6' },
  ];

  async ngOnInit() {
    const ctx = await this.store.requireSindico();
    if (!ctx) { this.router.navigate(['/']); return; }
    this.perfil.set(ctx.perfil);
    this.cond.set(ctx.cond);

    if (ctx.cond) {
      const sols = await this.store.getSolicitacoesDoCondominio(ctx.cond.id);
      this.pendentes.set(sols.filter(s => s.status === 'Pendente').length);

      // Só as abertas: prioridade mais alta primeiro; na mesma prioridade, as mais antigas
      const peso: Record<string, number> = { Alta: 0, 'Média': 1, Baixa: 2 };
      const abertas = sols
       .filter(s => solicitacaoAberta(s.status))
        .sort((a, b) =>
          (peso[a.prioridade ?? ''] ?? 3) - (peso[b.prioridade ?? ''] ?? 3) ||
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      this.atencao.set(abertas.slice(0, 3));
    }
    this.carregado.set(true);
  }
}