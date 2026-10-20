import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CondominioCompleto, Profile, StoreService } from '../../services/store';
import { initials } from '../../utils/format';
import { BottomNavMorador } from '../../components/bottom-nav-morador/bottom-nav-morador';

@Component({
  selector: 'app-morador-perfil',
  imports: [BottomNavMorador],
  templateUrl: './morador-perfil.html',
  styleUrl: './morador-perfil.css',
})
export class MoradorPerfil implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);

  perfil = signal<Profile | null>(null);
  cond = signal<CondominioCompleto | null>(null);
  iniciais = initials;

  async ngOnInit() {
    const p = await this.store.requireProfile('condomino');
    if (!p) { this.router.navigate(['/']); return; }
    this.perfil.set(p);
    this.cond.set(await this.store.getCondominio(p.condominio_id));
  }

  async sair() {
    await this.store.signOut();
    this.router.navigate(['/']);
  }
}