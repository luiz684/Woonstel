import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Aviso, CondominioCompleto, Profile, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { formatDateBR } from '../../utils/format';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';

@Component({
  selector: 'app-sindico-avisos',
  imports: [FormsModule, RouterLink, BottomNavSindico],
  templateUrl: './sindico-avisos.html',
  styleUrl: './sindico-avisos.css',
})
export class SindicoAvisos implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  private perfil: Profile | null = null;
  private cond: CondominioCompleto | null = null;

  avisos = signal<Aviso[]>([]);
  modo = signal<'lista' | 'form'>('lista');
  editandoId = signal<string | null>(null);
  excluindoId = signal<string | null>(null);
  salvando = signal(false);
  data = formatDateBR;

  titulo = '';
  mensagem = '';

  async ngOnInit() {
    const ctx = await this.store.requireSindico();
    if (!ctx) { this.router.navigate(['/']); return; }
    if (!ctx.cond) { this.router.navigate(['/sindico/cadastrar-condominio']); return; }
    this.perfil = ctx.perfil;
    this.cond = ctx.cond;
    await this.carregar();
  }

  private async carregar() {
    if (this.cond) this.avisos.set(await this.store.getAvisos(this.cond.id));
  }

  novo() {
    this.editandoId.set(null);
    this.titulo = '';
    this.mensagem = '';
    this.modo.set('form');
  }

  editar(a: Aviso) {
    this.excluindoId.set(null);
    this.editandoId.set(a.id);
    this.titulo = a.titulo;
    this.mensagem = a.mensagem;
    this.modo.set('form');
  }

  cancelar() {
    this.modo.set('lista');
  }

  async salvar() {
    if (!this.perfil || !this.cond) return;
    if (!this.titulo.trim() || !this.mensagem.trim()) {
      this.toast.show('Preencha o título e a mensagem.');
      return;
    }

    this.salvando.set(true);
    const id = this.editandoId();
    let ok = false;
    let msg = '';

    if (id) {
      const { data, error } = await this.store.atualizarAviso(id, this.titulo.trim(), this.mensagem.trim());
      ok = !error && !!data && data.length > 0;
      msg = error?.message ?? 'Sem permissão para alterar este aviso.';
    } else {
      const { error } = await this.store.criarAviso(
        this.cond.id, this.titulo.trim(), this.mensagem.trim(), this.perfil.nome);
      ok = !error;
      msg = error?.message ?? '';
    }
    this.salvando.set(false);

    if (!ok) { this.toast.show('Erro ao salvar: ' + msg); return; }
    this.toast.show(id ? 'Aviso atualizado!' : 'Aviso publicado!');
    this.modo.set('lista');
    await this.carregar();
  }

  pedirExclusao(a: Aviso) {
    this.excluindoId.set(a.id);
  }

  cancelarExclusao() {
    this.excluindoId.set(null);
  }

  async confirmarExclusao(a: Aviso) {
    const { data, error } = await this.store.excluirAviso(a.id);
    if (error || !data || data.length === 0) {
      this.toast.show('Não foi possível excluir: ' + (error?.message ?? 'sem permissão.'));
      return;
    }
    this.excluindoId.set(null);
    this.toast.show('Aviso excluído.');
    await this.carregar();
  }
}