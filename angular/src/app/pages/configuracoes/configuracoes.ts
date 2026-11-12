import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Preferencias, Profile, StoreService } from '../../services/store';
import { Fonte, PreferenciasService, Tema } from '../../services/preferencias';
import { ToastService } from '../../services/toast';
import { senhaValida } from '../../utils/senha';
import { BottomNavMorador } from '../../components/bottom-nav-morador/bottom-nav-morador';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';
import { RegrasSenha } from '../../components/regras-senha/regras-senha';

type ChaveNotif = 'status' | 'comentario' | 'reserva_cancelada' | 'aviso';

@Component({
  selector: 'app-configuracoes',
  imports: [FormsModule, RouterLink, BottomNavMorador, BottomNavSindico, RegrasSenha],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.css',
})
export class Configuracoes implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private prefs = inject(PreferenciasService);

  tipo = (this.route.snapshot.data['tipo'] ?? 'condomino') as 'condomino' | 'sindico';
  a = this.prefs.aparencia;
  perfil = signal<Profile | null>(null);

  voltarRota = this.tipo === 'sindico' ? '/sindico/perfil' : '/morador/perfil';

  temas: { valor: Tema; rotulo: string }[] = [
    { valor: 'sistema', rotulo: 'Automático' },
    { valor: 'claro', rotulo: 'Claro' },
    { valor: 'escuro', rotulo: 'Escuro' },
  ];
  fontes: { valor: Fonte; rotulo: string }[] = [
    { valor: 100, rotulo: 'Normal' },
    { valor: 115, rotulo: 'Grande' },
    { valor: 130, rotulo: 'Muito grande' },
  ];
  notificacoes: { chave: ChaveNotif; rotulo: string }[] = [
    { chave: 'status', rotulo: 'Mudança de status das minhas solicitações' },
    { chave: 'comentario', rotulo: 'Respostas do síndico' },
    { chave: 'reserva_cancelada', rotulo: 'Reservas canceladas pelo síndico' },
    { chave: 'aviso', rotulo: 'Novos avisos do condomínio' },
  ];

  // alteração de senha
  senhaAberta = signal(false);
  salvandoSenha = signal(false);
  mostrarSenhas = signal(false);
  erroConfirmar = signal(false);
  atual = '';
  nova = '';
  confirmar = '';

  async ngOnInit() {
    const p = await this.store.requireProfile(this.tipo);
    if (!p) { this.router.navigate(['/']); return; }
    this.perfil.set(p);
  }

  mudarTema(v: Tema) { this.prefs.atualizar({ tema: v }); }
  mudarFonte(v: Fonte) { this.prefs.atualizar({ fonte: v }); }
  mudarContraste(e: Event) { this.prefs.atualizar({ contraste: (e.target as HTMLInputElement).checked }); }
  mudarMovimento(e: Event) { this.prefs.atualizar({ semMovimento: (e.target as HTMLInputElement).checked }); }
  mudarVlibras(e: Event) { this.prefs.atualizar({ vlibras: (e.target as HTMLInputElement).checked }); }

  notifAtiva(chave: ChaveNotif): boolean {
    return this.perfil()?.preferencias?.notificacoes?.[chave] !== false;
  }

  async alternarNotif(chave: ChaveNotif, e: Event) {
    const p = this.perfil();
    const caixa = e.target as HTMLInputElement;
    if (!p) return;

    const ligado = caixa.checked;
    const novas: Preferencias = {
      ...(p.preferencias ?? {}),
      notificacoes: { ...(p.preferencias?.notificacoes ?? {}), [chave]: ligado },
    };
    const { data, error } = await this.store.salvarPreferencias(p.id, novas);
    if (error || !data || data.length === 0) {
      caixa.checked = !ligado;
      this.toast.show('Não foi possível salvar a preferência.');
      return;
    }
    this.perfil.set({ ...p, preferencias: novas });
  }

  abrirSenha() {
    this.atual = '';
    this.nova = '';
    this.confirmar = '';
    this.erroConfirmar.set(false);
    this.senhaAberta.set(true);
  }

  async alterarSenha() {
    const p = this.perfil();
    if (!p) return;
    this.erroConfirmar.set(false);

    if (!this.atual) { this.toast.show('Informe a senha atual.'); return; }
    if (!senhaValida(this.nova)) { this.toast.show('A nova senha ainda não atende a todas as regras.'); return; }
    if (this.nova !== this.confirmar) { this.erroConfirmar.set(true); return; }
    if (this.nova === this.atual) { this.toast.show('A nova senha precisa ser diferente da atual.'); return; }

    this.salvandoSenha.set(true);
    const erro = await this.store.alterarSenha(p.email, this.atual, this.nova);
    this.salvandoSenha.set(false);

    if (erro) { this.toast.show(erro); return; }
    this.senhaAberta.set(false);
    this.atual = '';
    this.nova = '';
    this.confirmar = '';
    this.toast.show('Senha alterada com sucesso!');
  }

  async exportar() {
    const p = this.perfil();
    if (!p) return;
    const dados = await this.store.exportarDados(p);
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'woonstel-meus-dados.json';
    link.click();
    URL.revokeObjectURL(url);
    this.toast.show('Arquivo gerado.');
  }
}