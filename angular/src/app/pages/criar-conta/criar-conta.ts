import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StoreService, User } from '../../services/store';
import { ToastService } from '../../services/toast';
import { formatCpf } from '../../utils/cpf';

@Component({
  selector: 'app-criar-conta',
  imports: [FormsModule, RouterLink],
  templateUrl: './criar-conta.html',
  styleUrl: './criar-conta.css',
})
export class CriarConta {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  condominios = this.store.getCondominios();

  nome = '';
  email = '';
  cpf = '';
  senha = '';
  confirmar = '';
  tipo = '';
  condominioId = this.condominios[0]?.id ?? '';
  apto = '';

  mostrarSenha = signal(false);
  mostrarConfirmar = signal(false);
  erroConfirmar = signal(false);

  onCpf(e: Event) {
    const el = e.target as HTMLInputElement;
    this.cpf = formatCpf(el.value);
    el.value = this.cpf;
  }

  criarConta() {
    this.erroConfirmar.set(false);

    if (!this.nome.trim() || !this.email.trim() || this.cpf.length < 14 || !this.senha || !this.tipo) {
      this.toast.show('Preencha todos os campos antes de continuar.');
      return;
    }
    if (this.senha !== this.confirmar) {
      this.erroConfirmar.set(true);
      return;
    }
    if (this.store.findUserByCpfTipo(this.cpf, this.tipo)) {
      this.toast.show('Já existe uma conta com esse CPF para esse tipo de usuário.');
      return;
    }

    const user: User = {
      id: 'u-' + Date.now(),
      nome: this.nome.trim(),
      email: this.email.trim(),
      cpf: this.cpf,
      senha: this.senha,
      tipo: this.tipo as User['tipo'],
    };

    if (this.tipo === 'condomino') {
      if (!this.condominioId) {
        this.toast.show('Selecione o condomínio ao qual você pertence.');
        return;
      }
      user.condominioId = this.condominioId;
      user.apto = this.apto.trim() || '—';
    }

    this.store.saveUser(user);
    this.store.setSession(user.id);

    if (this.tipo === 'sindico') {
      this.router.navigate(['/sindico/cadastrar-condominio'], { queryParams: { onboarding: 1 } });
    } else if (this.tipo === 'condomino') {
      this.router.navigate(['/morador/inicio']);
    } else {
      this.store.clearSession();
      this.toast.show('Conta criada! Área do funcionário em breve.');
      setTimeout(() => this.router.navigate(['/']), 1600);
    }
  }
}