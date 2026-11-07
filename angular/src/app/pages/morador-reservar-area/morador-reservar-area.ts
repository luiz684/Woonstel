import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Area, Profile, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { brl } from '../../utils/format';

@Component({
  selector: 'app-morador-reservar-area',
  imports: [FormsModule, RouterLink],
  templateUrl: './morador-reservar-area.html',
  styleUrl: './morador-reservar-area.css',
})
export class MoradorReservarArea implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  private perfil: Profile | null = null;
  areas = signal<Area[]>([]);
  salvando = signal(false);
  indisponiveis = signal<Area[]>([]);
  brl = brl;

  areaId = '';
  data = '';
  horario = '12:00';
  periodo = 'Tarde (12:00 às 18:00)';
  aceite = false;
  hoje = new Date().toISOString().slice(0, 10);

  get area(): Area | undefined {
    return this.areas().find(a => a.id === this.areaId);
  }

    async ngOnInit() {
    this.perfil = await this.store.requireProfile('condomino');
    if (!this.perfil) { this.router.navigate(['/']); return; }
    const lista = await this.store.getAreas(this.perfil.condominio_id);
    this.areas.set(lista.filter(a => a.disponivel));
    this.indisponiveis.set(lista.filter(a => !a.disponivel));
    this.areaId = this.areas()[0]?.id ?? '';
  }

  async reservar() {
    if (!this.perfil || !this.area) return;
    if (!this.data) { this.toast.show('Selecione a data da reserva.'); return; }
    if (!this.aceite) { this.toast.show('Você precisa aceitar as regras de uso.'); return; }

    this.salvando.set(true);
    const { error } = await this.store.criarReserva(this.perfil, this.area, {
      data: this.data,
      horario: this.horario,
      periodo: this.periodo,
    });
    this.salvando.set(false);

    if (error) { this.toast.show('Erro ao reservar: ' + error.message); return; }
    this.toast.show('Área reservada com sucesso!');
    setTimeout(() => this.router.navigate(['/morador/reservas']), 1000);
  }
}