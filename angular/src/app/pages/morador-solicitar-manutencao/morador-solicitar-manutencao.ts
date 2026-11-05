import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Profile, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-morador-solicitar-manutencao',
  imports: [FormsModule, RouterLink],
  templateUrl: './morador-solicitar-manutencao.html',
  styleUrl: './morador-solicitar-manutencao.css',
})
export class MoradorSolicitarManutencao implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  private perfil: Profile | null = null;
  private arquivo: File | null = null;

  salvando = signal(false);
  nomeFoto = signal('');

  prioridades = ['Baixa', 'Média', 'Alta'];
  prioridade = signal('Média');

  titulo = '';
  categoria = 'Elétrica';
  descricao = '';
  local = '';

  async ngOnInit() {
    this.perfil = await this.store.requireProfile('condomino');
    if (!this.perfil) this.router.navigate(['/']);
  }

  onFoto(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.toast.show('A foto deve ter no máximo 5 MB.');
      input.value = '';
      return;
    }
    this.arquivo = file;
    this.nomeFoto.set(file.name);
  }

  async registrar() {
    if (!this.perfil) return;
    if (!this.titulo.trim() || !this.local.trim() || !this.descricao.trim()) {
      this.toast.show('Preencha título, localização e descrição.');
      return;
    }
    if (!this.perfil.condominio_id) {
      this.toast.show('Sua conta ainda não está vinculada a um condomínio.');
      return;
    }

    const now = new Date();
    const dataLabel =
      now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '') +
      ' · ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    this.salvando.set(true);

    let fotoPath: string | null = null;
    if (this.arquivo) {
      fotoPath = await this.store.uploadFotoSolicitacao(this.perfil, this.arquivo);
      if (!fotoPath) {
        this.salvando.set(false);
        this.toast.show('Não foi possível enviar a foto. Tente outra imagem.');
        return;
      }
    }

    const { error } = await this.store.criarSolicitacao(this.perfil, {
      titulo: this.titulo.trim(),
      categoria: this.categoria,
      descricao: this.descricao.trim(),
      localizacao: this.local.trim(),
      prioridade: this.prioridade(),
      fotoPath,
      dataLabel,
    });
    this.salvando.set(false);

    if (error) { this.toast.show('Erro ao registrar: ' + error.message); return; }
    this.toast.show('Solicitação registrada com sucesso!');
    setTimeout(() => this.router.navigate(['/morador/minhas-solicitacoes']), 1000);
  }
}