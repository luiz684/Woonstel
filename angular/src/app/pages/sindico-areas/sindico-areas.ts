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
  brl = brl;

  nome = '';
  capacidade = '';
  taxa: number | null = 0;

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
  }

  editar(a: Area) {
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

  async alternarDisponibilidade(a: Area) {
    let motivo: string | null = null;
    if (a.disponivel) {
      const resposta = prompt('Motivo da indisponibilidade (opcional):', '');
      if (resposta === null) return; // cancelou
      motivo = resposta.trim() || null;
    }
    const { data, error } = await this.store.definirDisponibilidade(a.id, !a.disponivel, motivo);
    if (error || !data || data.length === 0) {
      this.toast.show('Não foi possível alterar a disponibilidade.');
      return;
    }
    this.toast.show(a.disponivel ? 'Área marcada como indisponível.' : 'Área disponível novamente.');
    await this.carregar();
  }

  async remover(a: Area) {
    if (!confirm(`Remover "${a.nome}"?`)) return;
    const { error } = await this.store.excluirArea(a.id);
    if (error) { this.toast.show('Erro ao remover: ' + error.message); return; }
    this.toast.show('Área removida.');
    if (this.editandoId() === a.id) this.cancelarEdicao();
    await this.carregar();
  }
}