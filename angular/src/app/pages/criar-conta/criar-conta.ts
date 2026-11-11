import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { formatCpf } from '../../utils/cpf';
import { senhaValida } from '../../utils/senha';
import { RegrasSenha } from '../../components/regras-senha/regras-senha';

@Component({
  selector: 'app-criar-conta',
  imports: [FormsModule, RouterLink, RegrasSenha],
  templateUrl: './criar-conta.html',
  styleUrl: './criar-conta.css',
})
export class CriarConta {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  nome = '';
  email = '';
  cpf = '';
  senha = '';
  confirmar = '';

  mostrarSenha = signal(false);
  erroConfirmar = signal(false);
  salvando = signal(false);

  onCpf(e: Event) {
    const el = e.target as HTMLInputElement;
    this.cpf = formatCpf(el.value);
    el.value = this.cpf;
  }

  async criarConta() {
    this.erroConfirmar.set(false);

    if (!this.nome.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email.trim()) || this.cpf.length < 14) {
      this.toast.show('Preencha nome, e-mail válido e CPF.');
      return;
    }
    if (!senhaValida(this.senha)) {
      this.toast.show('A senha ainda não atende a todas as regras.');
      return;
    }
    if (this.senha !== this.confirmar) {
      this.erroConfirmar.set(true);
      return;
    }

    this.salvando.set(true);
    const { error } = await this.store.signUp({
      nome: this.nome.trim(),
      email: this.email.trim().toLowerCase(),
      cpf: this.cpf,
      senha: this.senha,
      tipo: 'sindico',
    });
    this.salvando.set(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('database error') || msg.includes('already')) {
        this.toast.show('Não foi possível criar a conta. Verifique se o CPF ou o e-mail já estão cadastrados.');
      } else {
        this.toast.show(error.message);
      }
      return;
    }

    this.router.navigate(['/sindico/cadastrar-condominio'], { queryParams: { onboarding: 1 } });
  }
}