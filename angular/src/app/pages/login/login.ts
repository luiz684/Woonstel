import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { formatCpf } from '../../utils/cpf';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  cpf = '';
  tipo = '';
  senha = '';
  mostrarSenha = signal(false);
  erro = signal({ cpf: false, tipo: false, senha: false });

  async ngOnInit() {
  const u = await this.store.getCurrentProfile();
  if (u) this.irParaHome(u.tipo);
}

  onCpf(e: Event) {
    const el = e.target as HTMLInputElement;
    this.cpf = formatCpf(el.value);
    el.value = this.cpf;
  }

  async entrar() {
  const erro = {
    cpf: this.cpf.length < 14,
    tipo: !this.tipo,
    senha: !this.senha,
  };
  this.erro.set(erro);
  if (erro.cpf || erro.tipo || erro.senha) return;

  const user = await this.store.signIn(this.cpf, this.tipo, this.senha);
  if (!user) {
    this.toast.show('CPF, tipo de usuário ou senha incorretos.');
    return;
  }
  this.irParaHome(user.tipo);
}

  private irParaHome(tipo: string) {
    
    this.router.navigate([tipo === 'sindico' ? '/sindico/inicio' : '/morador/inicio']);
  }
}