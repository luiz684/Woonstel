import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { formatCpf } from '../../utils/cpf';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  cpf = '';
  tipo = '';
  senha = '';
  mostrarSenha = signal(false);
  tipoBloqueado = signal(false);
  entrando = signal(false);
  erro = signal({ cpf: false, tipo: false, senha: false });

  async ngOnInit() {
    const q = this.route.snapshot.queryParamMap;
    const t = q.get('tipo');
    if (t === 'condomino' || t === 'sindico' || t === 'funcionario') {
      this.tipo = t;
      this.tipoBloqueado.set(true);
    }
    if (q.get('novo') === '1') {
      this.toast.show('Senha criada! Entre com seu CPF e a nova senha.');
    }

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

    this.entrando.set(true);
    const user = await this.store.signIn(this.cpf, this.tipo, this.senha);
    this.entrando.set(false);

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