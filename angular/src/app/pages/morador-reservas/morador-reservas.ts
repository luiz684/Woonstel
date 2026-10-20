import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Reserva, StoreService } from '../../services/store';
import { brl, formatDateOnlyBR } from '../../utils/format';
import { BottomNavMorador } from '../../components/bottom-nav-morador/bottom-nav-morador';

@Component({
  selector: 'app-morador-reservas',
  imports: [RouterLink, BottomNavMorador],
  templateUrl: './morador-reservas.html',
  styleUrl: './morador-reservas.css',
})
export class MoradorReservas implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);

  reservas = signal<Reserva[]>([]);
  data = formatDateOnlyBR;
  brl = brl;

  async ngOnInit() {
    const p = await this.store.requireProfile('condomino');
    if (!p) { this.router.navigate(['/']); return; }
    this.reservas.set(await this.store.getReservasDoMorador(p.id));
  }
}