import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Profile, StoreService } from '../../services/store';
import { initials } from '../../utils/format';

@Component({
  selector: 'app-sindico-moradores',
  imports: [RouterLink],
  templateUrl: './sindico-moradores.html',
  styleUrl: './sindico-moradores.css',
})
export class SindicoMoradores implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);

  moradores = signal<Profile[]>([]);
  iniciais = initials;

  async ngOnInit() {
    const ctx = await this.store.requireSindico();
    if (!ctx) { this.router.navigate(['/']); return; }
    if (!ctx.cond) { this.router.navigate(['/sindico/cadastrar-condominio']); return; }
    this.moradores.set(await this.store.getMoradores(ctx.cond.id));
  }
}