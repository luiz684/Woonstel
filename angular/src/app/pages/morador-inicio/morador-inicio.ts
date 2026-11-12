import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Aviso, CondominioCompleto, Profile, StoreService } from '../../services/store';
import { formatDateBR, initials, primeiroNome, solicitacaoAberta } from '../../utils/format';
import { BottomNavMorador } from '../../components/bottom-nav-morador/bottom-nav-morador';
import { Avatar } from '../../components/avatar/avatar';

interface Card { rota: string; rotulo: string; icone: string; }

@Component({
  selector: 'app-morador-inicio',
  imports: [RouterLink, BottomNavMorador, Avatar],
  templateUrl: './morador-inicio.html',
  styleUrl: './morador-inicio.css',
})
export class MoradorInicio implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);

  perfil = signal<Profile | null>(null);
  cond = signal<CondominioCompleto | null>(null);
  pendentes = signal(0);
  avisos = signal<Aviso[]>([]);
  naoLidos = signal(0);
  carregado = signal(false);

  iniciais = initials;
  primeiroNome = primeiroNome;
  data = formatDateBR;

  cards: Card[] = [
    { rota: '/morador/solicitar-manutencao', rotulo: 'Solicitar manutenção',
      icone: 'M14.7 6.3a4 4 0 01-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 015.4-5.4l-3-3z' },
    { rota: '/morador/minhas-solicitacoes', rotulo: 'Minhas solicitações',
      icone: 'M9 5h6M9 3v4M4 8h16v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8z' },
    { rota: '/morador/reservar-area', rotulo: 'Reservar área',
      icone: 'M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2zM3 10h18M8 3v4M16 3v4' },
    { rota: '/morador/reservas', rotulo: 'Minhas reservas',
      icone: 'M19 21l-7-4-7 4V5a2 2 0 012-2h10a2 2 0 012 2v16z' },
  ];

  async ngOnInit() {
    const p = await this.store.requireProfile('condomino');
    if (!p) { this.router.navigate(['/']); return; }
    this.perfil.set(p);

    const [cond, sols, avisos, naoLidos] = await Promise.all([
      this.store.getCondominio(p.condominio_id),
      this.store.getSolicitacoesByMorador(p.id),
      this.store.getAvisos(p.condominio_id),
      this.store.countNotificacoesNaoLidas(),
    ]);
    this.cond.set(cond);
    this.pendentes.set(sols.filter(s => solicitacaoAberta(s.status)).length);
    this.avisos.set(avisos.slice(0, 3));
    this.naoLidos.set(naoLidos);
    this.carregado.set(true);
  }
}