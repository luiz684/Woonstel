import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Reserva, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import {
  BADGE_RESERVA, FILTROS_RESERVA, MOTIVOS_MORADOR, brl, formatDateOnlyBR,
  ordenarReservas, reservaAtiva, reservaNoFiltro, rotuloReserva,
} from '../../utils/format';
import { BottomNavMorador } from '../../components/bottom-nav-morador/bottom-nav-morador';
import { CancelarReserva } from '../../components/cancelar-reserva/cancelar-reserva';
import { FiltroChips } from '../../components/filtro-chips/filtro-chips';

@Component({
  selector: 'app-morador-reservas',
  imports: [RouterLink, BottomNavMorador, CancelarReserva, FiltroChips],
  templateUrl: './morador-reservas.html',
  styleUrl: './morador-reservas.css',
})
export class MoradorReservas implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  private moradorId = '';
  reservas = signal<Reserva[]>([]);
  filtro = signal('Em aberto');
  cancelandoId = signal<string | null>(null);
  salvando = signal(false);

  motivos = MOTIVOS_MORADOR;
  data = formatDateOnlyBR;
  brl = brl;
  ativa = reservaAtiva;
  rotulo = rotuloReserva;
  badge = BADGE_RESERVA;

  opcoes = computed(() =>
    FILTROS_RESERVA.map(valor => ({
      valor,
      qtd: this.reservas().filter(r => reservaNoFiltro(rotuloReserva(r), valor)).length,
    })));

  lista = computed(() =>
    this.reservas().filter(r => reservaNoFiltro(rotuloReserva(r), this.filtro())));

  async ngOnInit() {
    const p = await this.store.requireProfile('condomino');
    if (!p) { this.router.navigate(['/']); return; }
    this.moradorId = p.id;
    await this.carregar();
  }

  private async carregar() {
    this.reservas.set(ordenarReservas(await this.store.getReservasDoMorador(this.moradorId)));
  }

  async cancelar(r: Reserva, motivo: string) {
    this.salvando.set(true);
    const { error } = await this.store.cancelarReserva(r.id, motivo);
    this.salvando.set(false);
    if (error) { this.toast.show(error.message); return; }
    this.toast.show('Reserva cancelada.');
    this.cancelandoId.set(null);
    await this.carregar();
  }
}