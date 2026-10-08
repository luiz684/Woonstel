import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Aviso, CondominioCompleto, Profile, StoreService } from '../../services/store';
import { formatDateBR, initials, primeiroNome } from '../../utils/format';

@Component({
  selector: 'app-morador-inicio',
  imports: [RouterLink],
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

  iniciais = initials;
  primeiroNome = primeiroNome;
  data = formatDateBR;

  async ngOnInit() {
    const p = await this.store.requireProfile('condomino');
    if (!p) { this.router.navigate(['/']); return; }
    this.perfil.set(p);

    const [cond, sols, avisos] = await Promise.all([
      this.store.getCondominio(p.condominio_id),
      this.store.getSolicitacoesByMorador(p.id),
      this.store.getAvisos(p.condominio_id),
    ]);
    this.cond.set(cond);
    this.pendentes.set(sols.filter(s => s.status !== 'Resolvida').length);
    this.avisos.set(avisos);
  }

    async sair() {
    await this.store.signOut();
    this.router.navigate(['/']);
  }
}