import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Area, CondominioCompleto, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { brl } from '../../utils/format';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';

function formatarReais(centavos: number): string {
  if (centavos <= 0) return '';
  return 'R$ ' + (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

@Component({
  selector: 'app-sindico-areas',
  imports: [FormsModule, RouterLink, BottomNavSindico],
  templateUrl: './sindico-areas.html',
  styleUrl: './sindico-areas.css',
})
export class SindicoAreas implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  private cond: CondominioCompleto | null = null;

  areas = signal<Area[]>([]);
  salvando = signal(false);
  editandoId = signal<string | null>(null);
  motivoAbertoId = signal<string | null>(null);
  removendoId = signal<string | null>(null);
  brl = brl;

  nome = '';
  capacidade = '';
  motivo = '';

  // campos com máscara
  taxaCentavos = 0;
  taxaTexto = '';
  duracaoMin: number | null = null;
  duracaoTexto = '';

  get textoDuracao(): string {
    const d = this.duracaoMin ?? 0;
    const h = Math.floor(d / 60);
    const m = d % 60;
    if (h === 0) return `${m} min`;
    return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
  }

  async ngOnInit() {
    const ctx = await this.store.requireSindico();
    if (!ctx) { this.router.navigate(['/']); return; }
    if (!ctx.cond) { this.router.navigate(['/sindico/cadastrar-condominio']); return; }
    this.cond = ctx.cond;
    await this.carregar();
  }

  private async carregar() {
    if (this.cond) this.areas.set(await this.store.getAreas(this.cond.id));
  }


  onTaxa(e: Event) {
    const el = e.target as HTMLInputElement;
    const digitos = el.value.replace(/\D/g, '').slice(0, 8);
    this.taxaCentavos = Number(digitos || '0');
    this.taxaTexto = formatarReais(this.taxaCentavos);
    el.value = this.taxaTexto;
  }

  onDuracao(e: Event) {
    const el = e.target as HTMLInputElement;
    let n = Number(el.value.replace(/\D/g, '').slice(0, 3) || '0');
    if (n > 720) n = 720;
    this.duracaoMin = n > 0 ? n : null;
    this.duracaoTexto = n > 0 ? String(n) : '';
    el.value = this.duracaoTexto;
  }


  private limpar() {
    this.nome = '';
    this.capacidade = '';
    this.taxaCentavos = 0;
    this.taxaTexto = '';
    this.duracaoMin = null;
    this.duracaoTexto = '';
  }

  editar(a: Area) {
    this.motivoAbertoId.set(null);
    this.removendoId.set(null);
    this.editandoId.set(a.id);
    this.nome = a.nome;
    this.capacidade = a.capacidade ?? '';
    this.taxaCentavos = Math.round(a.taxa * 100);
    this.taxaTexto = formatarReais(this.taxaCentavos);
    this.duracaoMin = a.duracao_min;
    this.duracaoTexto = a.duracao_min ? String(a.duracao_min) : '';
    document.getElementById('nome')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  cancelarEdicao() {
    this.editandoId.set(null);
    this.limpar();
  }

  async salvar() {
    if (!this.cond) return;
    if (!this.nome.trim()) {
      this.toast.show('Informe o nome da área.');
      return;
    }
    if (this.duracaoMin !== null && this.duracaoMin < 15) {
      this.toast.show('A duração mínima de cada reserva é 15 minutos.');
      return;
    }

    const dados = {
      nome: this.nome.trim(),
      capacidade: this.capacidade.trim(),
      taxa: this.taxaCentavos / 100,
      duracao_min: this.duracaoMin,
    };

    this.salvando.set(true);
    const id = this.editandoId();
    let ok = false;
    let msg = '';

    if (id) {
      const { data, error } = await this.store.atualizarArea(id, dados);
      ok = !error && !!data && data.length > 0;
      msg = error?.message ?? 'Sem permissão para alterar esta área.';
    } else {
      const { error } = await this.store.criarArea(this.cond.id, dados);
      ok = !error;
      msg = error?.message ?? '';
    }
    this.salvando.set(false);

    if (!ok) { this.toast.show('Erro ao salvar: ' + msg); return; }
    this.toast.show(id ? 'Área atualizada!' : 'Área cadastrada!');
    this.cancelarEdicao();
    await this.carregar();
  }


  abrirIndisponibilidade(a: Area) {
    this.removendoId.set(null);
    this.motivo = '';
    this.motivoAbertoId.set(a.id);
  }

  fecharIndisponibilidade() {
    this.motivoAbertoId.set(null);
  }

  async confirmarIndisponibilidade(a: Area) {
    const { data, error } = await this.store.definirDisponibilidade(a.id, false, this.motivo.trim() || null);
    if (error || !data || data.length === 0) {
      this.toast.show('Não foi possível alterar: ' + (error?.message ?? 'sem permissão.'));
      return;
    }
    this.motivoAbertoId.set(null);
    this.toast.show('Área marcada como indisponível.');
    await this.carregar();
  }

  async disponibilizar(a: Area) {
    const { data, error } = await this.store.definirDisponibilidade(a.id, true, null);
    if (error || !data || data.length === 0) {
      this.toast.show('Não foi possível alterar: ' + (error?.message ?? 'sem permissão.'));
      return;
    }
    this.toast.show('Área disponível novamente.');
    await this.carregar();
  }


  pedirRemocao(a: Area) {
    this.motivoAbertoId.set(null);
    this.removendoId.set(a.id);
  }

  cancelarRemocao() {
    this.removendoId.set(null);
  }

  async confirmarRemocao(a: Area) {
    const { data, error } = await this.store.excluirArea(a.id);
    if (error || !data || data.length === 0) {
      this.toast.show('Não foi possível remover: ' + (error?.message ?? 'sem permissão.'));
      return;
    }
    this.removendoId.set(null);
    this.toast.show('Área removida.');
    if (this.editandoId() === a.id) this.cancelarEdicao();
    await this.carregar();
  }
}