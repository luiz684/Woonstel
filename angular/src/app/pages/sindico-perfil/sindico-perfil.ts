import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CondominioCompleto, Profile, StoreService } from '../../services/store';
import { initials } from '../../utils/format';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';

@Component({
  selector: 'app-sindico-perfil',
  imports: [RouterLink, BottomNavSindico],
  templateUrl: './sindico-perfil.html',
  styleUrl: './sindico-perfil.css',
})
export class SindicoPerfil implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);

  perfil = signal<Profile | null>(null);
  cond = signal<CondominioCompleto | null>(null);
  iniciais = initials;

  async ngOnInit() {
    const ctx = await this.store.requireSindico();
    if (!ctx) { this.router.navigate(['/']); return; }
    this.perfil.set(ctx.perfil);
    this.cond.set(ctx.cond);
  }

  async sair() {
    await this.store.signOut();
    this.router.navigate(['/']);
  }
}