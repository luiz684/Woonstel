import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReservaSindico, StoreService } from '../../services/store';
import { brl, formatDateOnlyBR } from '../../utils/format';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';

@Component({
  selector: 'app-sindico-reservas',
  imports: [RouterLink, BottomNavSindico],
  templateUrl: './sindico-reservas.html',
  styleUrl: './sindico-reservas.css',
})
export class SindicoReservas implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);

  reservas = signal<ReservaSindico[]>([]);
  carregado = signal(false);
  data = formatDateOnlyBR;
  brl = brl;

  async ngOnInit() {
    const ctx = await this.store.requireSindico();
    if (!ctx) { this.router.navigate(['/']); return; }
    if (!ctx.cond) { this.router.navigate(['/sindico/cadastrar-condominio']); return; }
    this.reservas.set(await this.store.getReservasDoCondominio(ctx.cond.id));
    this.carregado.set(true);
  }
}