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
  salvando = signal(false);
  nomeFoto = signal('');
  private temFoto = false;

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
    const file = (e.target as HTMLInputElement).files?.[0];
    this.temFoto = !!file;
    if (file) this.nomeFoto.set(file.name);
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
    const { error } = await this.store.criarSolicitacao(this.perfil, {
      titulo: this.titulo.trim(),
      categoria: this.categoria,
      descricao: this.descricao.trim(),
      localizacao: this.local.trim(),
      prioridade: this.prioridade(),
      foto: this.temFoto,
      dataLabel,
    });
    this.salvando.set(false);

    if (error) { this.toast.show('Erro ao registrar: ' + error.message); return; }
    this.toast.show('Solicitação registrada com sucesso!');
    setTimeout(() => this.router.navigate(['/morador/minhas-solicitacoes']), 1000);
  }
}