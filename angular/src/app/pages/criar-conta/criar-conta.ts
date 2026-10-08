import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Condominio, StoreService, Tipo } from '../../services/store';
import { ToastService } from '../../services/toast';
import { formatCpf } from '../../utils/cpf';

@Component({
  selector: 'app-criar-conta',
  imports: [FormsModule, RouterLink],
  templateUrl: './criar-conta.html',
  styleUrl: './criar-conta.css',
})
export class CriarConta implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  condominios = signal<Condominio[]>([]);

  nome = '';
  email = '';
  cpf = '';
  senha = '';
  confirmar = '';
  tipo = '';
  condominioId = '';
  apto = '';

  mostrarSenha = signal(false);
  mostrarConfirmar = signal(false);
  erroConfirmar = signal(false);

  async ngOnInit() {
    const lista = await this.store.getCondominios();
    this.condominios.set(lista);
    this.condominioId = lista[0]?.id ?? '';
  }

  onCpf(e: Event) {
    const el = e.target as HTMLInputElement;
    this.cpf = formatCpf(el.value);
    el.value = this.cpf;
  }

  async criarConta() {
    this.erroConfirmar.set(false);

    if (!this.nome.trim() || !this.email.trim() || this.cpf.length < 14 || !this.senha || !this.tipo) {
      this.toast.show('Preencha todos os campos antes de continuar.');
      return;
    }
    if (this.senha !== this.confirmar) {
      this.erroConfirmar.set(true);
      return;
    }
    if (this.senha.length < 6) {
      this.toast.show('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (this.tipo === 'condomino' && !this.condominioId) {
      this.toast.show('Selecione o condomínio ao qual você pertence.');
      return;
    }
    if (await this.store.findEmailByCpfTipo(this.cpf, this.tipo)) {
      this.toast.show('Já existe uma conta com esse CPF para esse tipo de usuário.');
      return;
    }

    const { error } = await this.store.signUp({
      nome: this.nome.trim(),
      email: this.email.trim(),
      cpf: this.cpf,
      senha: this.senha,
      tipo: this.tipo as Tipo,
      condominioId: this.tipo === 'condomino' ? this.condominioId : undefined,
      apto: this.tipo === 'condomino' ? this.apto.trim() || '—' : undefined,
    });

    if (error) {
      this.toast.show(error.message);
      return;
    }

    if (this.tipo === 'sindico') {
      this.router.navigate(['/sindico/cadastrar-condominio'], { queryParams: { onboarding: 1 } });
    } else if (this.tipo === 'condomino') {
      this.router.navigate(['/morador/inicio']);
    } else {
      await this.store.signOut();
      this.toast.show('Conta criada! Área do funcionário em breve.');
      setTimeout(() => this.router.navigate(['/']), 1600);
    }
  }
}