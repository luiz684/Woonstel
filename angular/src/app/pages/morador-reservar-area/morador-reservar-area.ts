import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Area, Profile, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { brl } from '../../utils/format';
import { BottomNavMorador } from '../../components/bottom-nav-morador/bottom-nav-morador';

interface Faixa { inicio: string; fim: string; }
interface Slot extends Faixa { indisponivel: boolean; }

const ABERTURA = 8 * 60;    
const FECHAMENTO = 23 * 60; 

const paraMin = (h: string): number => {
  const [a, b] = h.split(':').map(Number);
  return a * 60 + b;
};
const paraHora = (m: number): string =>
  String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const sobrepoe = (aIni: number, aFim: number, bIni: number, bFim: number): boolean =>
  aIni < bFim && bIni < aFim;

function dataLocal(d: Date): string {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

@Component({
  selector: 'app-morador-reservar-area',
  imports: [FormsModule, RouterLink, BottomNavMorador],
  templateUrl: './morador-reservar-area.html',
  styleUrl: './morador-reservar-area.css',
})
export class MoradorReservarArea implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  private perfil: Profile | null = null;

  areas = signal<Area[]>([]);
  indisponiveis = signal<Area[]>([]);
  ocupados = signal<Faixa[]>([]);
  salvando = signal(false);
  brl = brl;

  areaId = '';
  data = '';
  inicio = '';
  fim = '';
  slotInicio = '';
  aceite = false;

  hoje = dataLocal(new Date());
  maxData = dataLocal(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));

  get area(): Area | undefined {
    return this.areas().find(a => a.id === this.areaId);
  }

  get duracao(): number | null {
    return this.area?.duracao_min ?? null;
  }

  get duracaoTexto(): string {
    const d = this.duracao ?? 0;
    const h = Math.floor(d / 60);
    const m = d % 60;
    if (h === 0) return `${m} min`;
    return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
  }

  private get agoraMin(): number | null {
    if (this.data !== this.hoje) return null;
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  }

  get slots(): Slot[] {
    const dur = this.duracao;
    if (!dur) return [];
    const agora = this.agoraMin;
    const lista: Slot[] = [];
    for (let s = ABERTURA; s + dur <= FECHAMENTO; s += dur) {
      const e = s + dur;
      const ocupado = this.ocupados().some(o => sobrepoe(s, e, paraMin(o.inicio), paraMin(o.fim)));
      const passou = agora !== null && s < agora;
      lista.push({ inicio: paraHora(s), fim: paraHora(e), indisponivel: ocupado || passou });
    }
    return lista;
  }

  get horariosDoDia(): string {
    return this.ocupados().map(o => `${o.inicio} às ${o.fim}`).join(', ');
  }

  async ngOnInit() {
    this.perfil = await this.store.requireProfile('condomino');
    if (!this.perfil) { this.router.navigate(['/']); return; }
    const lista = await this.store.getAreas(this.perfil.condominio_id);
    this.areas.set(lista.filter(a => a.disponivel));
    this.indisponiveis.set(lista.filter(a => !a.disponivel));
    this.areaId = this.areas()[0]?.id ?? '';
  }

  private dataValida(): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(this.data) && this.data >= this.hoje && this.data <= this.maxData;
  }

  private limparHorario() {
    this.slotInicio = '';
    this.inicio = '';
    this.fim = '';
  }

  private async carregarOcupados() {
    if (!this.areaId || !this.dataValida()) { this.ocupados.set([]); return; }
    this.ocupados.set(await this.store.getHorariosOcupados(this.areaId, this.data));

    // se o horário escolhido acabou de ficar indisponível, limpa a escolha
    const escolhido = this.slots.find(s => s.inicio === this.slotInicio);
    if (escolhido?.indisponivel) this.limparHorario();
  }

  aoMudarArea(id: string) {
    this.areaId = id;
    this.limparHorario();
    void this.carregarOcupados();
  }

  aoMudarData(d: string) {
    this.data = d;
    this.limparHorario();
    void this.carregarOcupados();
  }

  escolherSlot(s: Slot) {
    if (s.indisponivel) return;
    this.slotInicio = s.inicio;
    this.inicio = s.inicio;
    this.fim = s.fim;
  }

  async reservar() {
    if (!this.perfil || !this.area) return;

    if (!this.data) { this.toast.show('Selecione a data da reserva.'); return; }
    if (this.data < this.hoje) { this.toast.show('A data da reserva não pode ser anterior a hoje.'); return; }
    if (this.data > this.maxData) { this.toast.show('A reserva só pode ser feita com até 1 ano de antecedência.'); return; }
    if (!this.dataValida()) { this.toast.show('Informe uma data válida.'); return; }

    if (this.duracao) {
      if (!this.slotInicio) { this.toast.show('Escolha um horário.'); return; }
    } else {
      if (!this.inicio || !this.fim) { this.toast.show('Informe o horário de início e de fim.'); return; }
      const i = paraMin(this.inicio);
      const f = paraMin(this.fim);
      if (f <= i) { this.toast.show('O horário de fim deve ser depois do início.'); return; }
      if (i < ABERTURA || f > FECHAMENTO) {
        this.toast.show('As reservas podem ser feitas entre 08:00 e 23:00.');
        return;
      }
      if (this.ocupados().some(o => sobrepoe(i, f, paraMin(o.inicio), paraMin(o.fim)))) {
        this.toast.show(`Esse horário conflita com reservas existentes: ${this.horariosDoDia}.`);
        return;
      }
    }

    const agora = this.agoraMin;
    if (agora !== null && paraMin(this.inicio) < agora) {
      this.toast.show('Esse horário já passou. Escolha um horário a partir de agora.');
      return;
    }
    if (!this.aceite) { this.toast.show('Você precisa aceitar as regras de uso.'); return; }

    this.salvando.set(true);
    const { error } = await this.store.criarReserva(this.perfil, this.area, {
      data: this.data,
      inicio: this.inicio,
      fim: this.fim,
    });
    this.salvando.set(false);

    if (error) {
      if (error.code === '23505') {
        this.toast.show('Esse horário acabou de ser reservado por outra pessoa. Escolha outro.');
        this.limparHorario();
        await this.carregarOcupados();
      } else if (error.code === '23514') {
        this.toast.show(error.message);
      } else {
        this.toast.show('Erro ao reservar: ' + error.message);
      }
      return;
    }

    this.toast.show('Área reservada com sucesso!');
    setTimeout(() => this.router.navigate(['/morador/reservas']), 1000);
  }
}