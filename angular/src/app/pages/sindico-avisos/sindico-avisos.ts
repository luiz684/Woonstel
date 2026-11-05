import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Aviso, CondominioCompleto, Profile, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { formatDateBR } from '../../utils/format';

@Component({
  selector: 'app-sindico-avisos',
  imports: [FormsModule, RouterLink],
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
  mostrandoForm = signal(false);
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

  async publicar() {
    if (!this.perfil || !this.cond) return;
    if (!this.titulo.trim() || !this.mensagem.trim()) {
      this.toast.show('Preencha o título e a mensagem.');
      return;
    }
    this.salvando.set(true);
    const { error } = await this.store.criarAviso(
      this.cond.id, this.titulo.trim(), this.mensagem.trim(), this.perfil.nome);
    this.salvando.set(false);

    if (error) { this.toast.show('Erro ao publicar: ' + error.message); return; }
    this.toast.show('Aviso publicado!');
    this.titulo = '';
    this.mensagem = '';
    this.mostrandoForm.set(false);
    await this.carregar();
  }
}