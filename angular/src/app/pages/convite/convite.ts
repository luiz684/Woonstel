import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConviteInfo, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { senhaValida } from '../../utils/senha';
import { RegrasSenha } from '../../components/regras-senha/regras-senha';

@Component({
  selector: 'app-convite',
  imports: [FormsModule, RouterLink, RegrasSenha],
  templateUrl: './convite.html',
  styleUrl: './convite.css',
})
export class Convite implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  private token = '';
  info = signal<ConviteInfo | null>(null);
  carregado = signal(false);
  salvando = signal(false);
  mostrarSenha = signal(false);
  erroConfirmar = signal(false);

  senha = '';
  confirmar = '';

  async ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    this.info.set(this.token ? await this.store.getConviteInfo(this.token) : null);
    this.carregado.set(true);
  }

  async criarSenha() {
    const i = this.info();
    if (!i) return;
    this.erroConfirmar.set(false);

    if (!senhaValida(this.senha)) {
      this.toast.show('A senha ainda não atende a todas as regras.');
      return;
    }
    if (this.senha !== this.confirmar) {
      this.erroConfirmar.set(true);
      return;
    }

    this.salvando.set(true);
    const { error } = await this.store.signUpPorConvite(this.token, i.email, this.senha);
    this.salvando.set(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('database error') || msg.includes('convite')) {
        this.toast.show('Este convite não é mais válido. Peça um novo link ao síndico.');
      } else if (msg.includes('password')) {
        this.toast.show('A senha não atende às regras de segurança.');
      } else {
        this.toast.show('Não foi possível criar o acesso: ' + error.message);
      }
      return;
    }

    await this.store.signOut();
    this.router.navigate(['/'], { queryParams: { tipo: i.tipo, novo: 1 } });
  }
}