import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Area, CondominioCompleto, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { brl } from '../../utils/format';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';

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
  taxa: number | null = 0;
  motivo = '';
  duracao: null | undefined;

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

  private limpar() {
    this.nome = '';
    this.capacidade = '';
    this.taxa = 0;
    this.duracao = null;
  }


  editar(a: Area) {
    this.motivoAbertoId.set(null);
    this.removendoId.set(null);
    this.editandoId.set(a.id);
    this.nome = a.nome;
    this.capacidade = a.capacidade ?? '';
    this.taxa = a.taxa;
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
    const dados = {
      nome: this.nome.trim(),
      capacidade: this.capacidade.trim(),
      taxa: Number(this.taxa ?? 0),
      duracao_min: this.duracao ? Number(this.duracao) : null,
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