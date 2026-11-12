import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CondominioCompleto, Profile, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { reduzirImagem } from '../../utils/imagem';
import { formatTelefone, telefoneCompleto } from '../../utils/telefone';
import { Avatar } from '../avatar/avatar';

@Component({
  selector: 'app-perfil-form',
  imports: [FormsModule, RouterLink, Avatar],
  templateUrl: './perfil-form.html',
  styleUrl: './perfil-form.css',
})
export class PerfilForm implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  tipo = input.required<'condomino' | 'sindico'>();

  perfil = signal<Profile | null>(null);
  cond = signal<CondominioCompleto | null>(null);
  editando = signal(false);
  salvando = signal(false);
  enviandoFoto = signal(false);
  confirmandoRemocao = signal(false);

  nome = '';
  telefone = '';

  get rotuloTipo(): string {
    return this.tipo() === 'sindico' ? 'Síndico' : 'Condômino';
  }

  get configRota(): string {
    return this.tipo() === 'sindico' ? '/sindico/configuracoes' : '/morador/configuracoes';
  }

  async ngOnInit() {
    const p = await this.store.requireProfile(this.tipo());
    if (!p) { this.router.navigate(['/']); return; }
    this.perfil.set(p);
    this.cond.set(this.tipo() === 'sindico'
      ? await this.store.getCondominioDoSindico(p.id)
      : await this.store.getCondominio(p.condominio_id));
  }

  private async recarregar() {
    const p = await this.store.requireProfile(this.tipo());
    if (p) this.perfil.set(p);
  }

  editar() {
    const p = this.perfil();
    if (!p) return;
    this.nome = p.nome;
    this.telefone = p.telefone ?? '';
    this.editando.set(true);
  }

  cancelar() {
    this.editando.set(false);
  }

  onTelefone(e: Event) {
    const el = e.target as HTMLInputElement;
    this.telefone = formatTelefone(el.value);
    el.value = this.telefone;
  }

  async salvar() {
    const p = this.perfil();
    if (!p) return;
    const nome = this.nome.trim();
    if (nome.length < 3) { this.toast.show('Informe o nome completo.'); return; }
    if (this.telefone && !telefoneCompleto(this.telefone)) {
      this.toast.show('Telefone incompleto. Use o formato (11) 91234-5678.');
      return;
    }

    this.salvando.set(true);
    const { data, error } = await this.store.atualizarPerfil(p.id, {
      nome,
      telefone: this.telefone || null,
    });
    this.salvando.set(false);

    if (error || !data || data.length === 0) {
      this.toast.show('Não foi possível salvar: ' + (error?.message ?? 'sem permissão.'));
      return;
    }
    this.editando.set(false);
    this.toast.show('Dados atualizados!');
    await this.recarregar();
  }

  async onFoto(e: Event) {
    const p = this.perfil();
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!p || !file) return;
    if (!file.type.startsWith('image/')) { this.toast.show('Escolha um arquivo de imagem.'); return; }

    this.enviandoFoto.set(true);
    const pronta = await reduzirImagem(file, 512, 0.85);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(pronta.type)) {
      this.enviandoFoto.set(false);
      this.toast.show('Formato não suportado. Use JPG, PNG ou WEBP.');
      return;
    }
    if (pronta.size > 2 * 1024 * 1024) {
      this.enviandoFoto.set(false);
      this.toast.show('A foto é muito grande. Escolha outra.');
      return;
    }

    const erro = await this.store.enviarAvatar(p, pronta);
    this.enviandoFoto.set(false);
    if (erro) { this.toast.show(erro); return; }
    this.toast.show('Foto atualizada!');
    await this.recarregar();
  }

  async removerFoto() {
    const p = this.perfil();
    if (!p) return;
    const erro = await this.store.removerAvatar(p);
    this.confirmandoRemocao.set(false);
    if (erro) { this.toast.show(erro); return; }
    this.toast.show('Foto removida.');
    await this.recarregar();
  }

  async sair() {
    await this.store.signOut();
    this.router.navigate(['/']);
  }
}