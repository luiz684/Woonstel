import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Notificacao, StoreService } from '../../services/store';
import { dataHoraBR } from '../../utils/format';
import { BottomNavMorador } from '../../components/bottom-nav-morador/bottom-nav-morador';

@Component({
  selector: 'app-morador-notificacoes',
  imports: [RouterLink, BottomNavMorador],
  templateUrl: './morador-notificacoes.html',
  styleUrl: './morador-notificacoes.css',
})
export class MoradorNotificacoes implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);

  itens = signal<Notificacao[]>([]);
  novas = signal<Set<string>>(new Set());
  carregado = signal(false);
  data = dataHoraBR;

  async ngOnInit() {
    const p = await this.store.requireProfile('condomino');
    if (!p) { this.router.navigate(['/']); return; }

    const lista = await this.store.getNotificacoes();
    this.itens.set(lista);
    this.novas.set(new Set(lista.filter(n => !n.lida).map(n => n.id)));
    this.carregado.set(true);

  
    if (this.novas().size > 0) await this.store.marcarNotificacoesLidas();
  }
}