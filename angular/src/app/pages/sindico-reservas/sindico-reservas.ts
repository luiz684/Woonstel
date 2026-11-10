import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReservaSindico, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import {
  BADGE_RESERVA, FILTROS_RESERVA, MOTIVOS_SINDICO, brl, formatDateOnlyBR,
  ordenarReservas, reservaAtiva, reservaNoFiltro, rotuloReserva,
} from '../../utils/format';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';
import { CancelarReserva } from '../../components/cancelar-reserva/cancelar-reserva';
import { FiltroChips } from '../../components/filtro-chips/filtro-chips';

@Component({
  selector: 'app-sindico-reservas',
  imports: [RouterLink, BottomNavSindico, CancelarReserva, FiltroChips],
  templateUrl: './sindico-reservas.html',
  styleUrl: './sindico-reservas.css',
})
export class SindicoReservas implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  private condId = '';
  reservas = signal<ReservaSindico[]>([]);
  filtro = signal('Em aberto');
  cancelandoId = signal<string | null>(null);
  salvando = signal(false);

  motivos = MOTIVOS_SINDICO;
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
    const ctx = await this.store.requireSindico();
    if (!ctx) { this.router.navigate(['/']); return; }
    if (!ctx.cond) { this.router.navigate(['/sindico/cadastrar-condominio']); return; }
    this.condId = ctx.cond.id;
    await this.carregar();
  }

  private async carregar() {
    this.reservas.set(ordenarReservas(await this.store.getReservasDoCondominio(this.condId)));
  }

  async cancelar(r: ReservaSindico, motivo: string) {
    this.salvando.set(true);
    const { error } = await this.store.cancelarReserva(r.id, motivo);
    this.salvando.set(false);
    if (error) { this.toast.show(error.message); return; }
    this.toast.show('Reserva cancelada. O morador será avisado.');
    this.cancelandoId.set(null);
    await this.carregar();
  }
}