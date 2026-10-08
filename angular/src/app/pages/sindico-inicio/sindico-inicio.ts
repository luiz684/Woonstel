import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CondominioCompleto, Profile, Solicitacao, StoreService } from '../../services/store';
import { initials, primeiroNome } from '../../utils/format';

@Component({
  selector: 'app-sindico-inicio',
  imports: [RouterLink],
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
  moradores = signal(0);
  reservas = signal(0); 
  resolvidas = signal(0);
  recentes = signal<Solicitacao[]>([]);

  iniciais = initials;
  primeiroNome = primeiroNome;
  badgeMap: Record<string, string> = {
    'Pendente': 'badge-amber',
    'Em andamento': 'badge-blue',
    'Resolvida': 'badge-green',
  };

  async ngOnInit() {
    
    const p = await this.store.requireProfile('sindico');
    if (!p) { this.router.navigate(['/']); return; }
    this.perfil.set(p);

    const cond = await this.store.getCondominioDoSindico(p.id);
    this.cond.set(cond);

    if (cond) {
      const [sols, moradores, reservas] = await Promise.all([
        this.store.getSolicitacoesByCondominio(cond.id),
        this.store.countMoradores(cond.id),
        this.store.countReservas(cond.id),
      ]);
      this.pendentes.set(sols.filter(s => s.status === 'Pendente').length);
      this.resolvidas.set(sols.filter(s => s.status === 'Resolvida').length);
      this.moradores.set(moradores);
      this.reservas.set(reservas);
      this.recentes.set(sols.slice(0, 3));
    }
    this.carregado.set(true);
  }
    async sair() {
    await this.store.signOut();
    this.router.navigate(['/']);
  }
}