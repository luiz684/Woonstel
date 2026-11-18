import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CondominioCompleto, Preferencias, Profile, StoreService } from '../../services/store';
import { Fonte, PreferenciasService, Tema } from '../../services/preferencias';
import { ToastService } from '../../services/toast';
import { reduzirImagem } from '../../utils/imagem';
import { senhaValida } from '../../utils/senha';
import { formatTelefone, telefoneCompleto } from '../../utils/telefone';
import { Avatar } from '../../components/avatar/avatar';
import { Icone } from '../../components/icone/icone';
import { RegrasSenha } from '../../components/regras-senha/regras-senha';
import { BottomNavMorador } from '../../components/bottom-nav-morador/bottom-nav-morador';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';

type ChaveNotif = 'status' | 'comentario' | 'reserva_cancelada' | 'aviso';

@Component({
  selector: 'app-perfil',
  imports: [FormsModule, RouterLink, Avatar, Icone, RegrasSenha, BottomNavMorador, BottomNavSindico],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private prefs = inject(PreferenciasService);

  tipo = (this.route.snapshot.data['tipo'] ?? 'condomino') as 'condomino' | 'sindico';
  inicioRota = this.tipo === 'sindico' ? '/sindico/inicio' : '/morador/inicio';
  perfilRota = this.tipo === 'sindico' ? '/sindico/perfil' : '/morador/perfil';
  a = this.prefs.aparencia;

  secao = toSignal(this.route.paramMap.pipe(map(m => m.get('secao'))), { initialValue: null as string | null });

  perfil = signal<Profile | null>(null);
  cond = signal<CondominioCompleto | null>(null);
  sheet = signal(false);
  confirmandoRemocao = signal(false);
  confirmandoSaida = signal(false);
  salvando = signal(false);
  enviandoFoto = signal(false);

  nome = '';
  telefone = '';

  private todasSecoes = [
    { id: 'notificacoes', titulo: 'Notificações', sub: 'Avisos, solicitações e reservas', icone: 'sino' },
    { id: 'aparencia', titulo: 'Aparência', sub: 'Tema claro, escuro ou automático', icone: 'paleta' },
    { id: 'acessibilidade', titulo: 'Acessibilidade', sub: 'Letra, contraste, animações e Libras', icone: 'acessibilidade' },
    { id: 'conta', titulo: 'Conta e segurança', sub: 'Senha e acesso', icone: 'cadeado' },
    { id: 'privacidade', titulo: 'Privacidade e dados', sub: 'Seus dados e a LGPD', icone: 'escudo' },
    { id: 'sobre', titulo: 'Sobre', sub: 'Informações do Woonstel', icone: 'info' },
  ];

  temas: { valor: Tema; rotulo: string; icone: string }[] = [
    { valor: 'sistema', rotulo: 'Automático', icone: 'monitor' },
    { valor: 'claro', rotulo: 'Claro', icone: 'sol' },
    { valor: 'escuro', rotulo: 'Escuro', icone: 'lua' },
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

  salvandoSenha = signal(false);
  mostrarSenhas = signal(false);
  erroConfirmar = signal(false);
  atual = '';
  nova = '';
  confirmar = '';

  get secoes() {
    return this.tipo === 'condomino' ? this.todasSecoes : this.todasSecoes.filter(s => s.id !== 'notificacoes');
  }

  get rotuloTipo(): string {
    return this.tipo === 'sindico' ? 'Síndico' : 'Condômino';
  }

  get tituloTela(): string {
    const s = this.secao();
    if (s === 'editar') return 'Editar perfil';
    return this.todasSecoes.find(x => x.id === s)?.titulo ?? '';
  }

  async ngOnInit() {
    const p = await this.store.requireProfile(this.tipo);
    if (!p) { this.router.navigate(['/']); return; }

    const s = this.secao();
    const validas = ['editar', ...this.secoes.map(x => x.id)];
    if (s !== null && !validas.includes(s)) { this.router.navigate([this.perfilRota]); return; }

    this.perfil.set(p);
    this.nome = p.nome;
    this.telefone = p.telefone ?? '';
    this.cond.set(this.tipo === 'sindico'
      ? await this.store.getCondominioDoSindico(p.id)
      : await this.store.getCondominio(p.condominio_id));
  }

  private async recarregar() {
    const p = await this.store.requireProfile(this.tipo);
    if (p) this.perfil.set(p);
  }

  @HostListener('document:keydown.escape')
  aoEsc() {
    this.fecharSheet();
    this.confirmandoSaida.set(false);
  }

  onTelefone(e: Event) {
    const el = e.target as HTMLInputElement;
    this.telefone = formatTelefone(el.value);
    el.value = this.telefone;
  }

  async salvar() {
    const p = this.perfil();
    if (!p) return;
    const nome = this.nome.trim();
    if (nome.length < 3) { this.toast.show('Informe o nome completo.'); return; }
    if (this.telefone && !telefoneCompleto(this.telefone)) {
      this.toast.show('Telefone incompleto. Use o formato (11) 91234-5678.');
      return;
    }

    this.salvando.set(true);
    const { data, error } = await this.store.atualizarPerfil(p.id, { nome, telefone: this.telefone || null });
    this.salvando.set(false);

    if (error || !data || data.length === 0) {
      this.toast.show('Não foi possível salvar: ' + (error?.message ?? 'sem permissão.'));
      return;
    }
    this.toast.show('Dados atualizados!');
    this.router.navigate([this.perfilRota]);
  }

  fecharSheet() {
    this.sheet.set(false);
    this.confirmandoRemocao.set(false);
  }

  async onFoto(e: Event) {
    const p = this.perfil();
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!p || !file) return;
    if (!file.type.startsWith('image/')) { this.toast.show('Escolha um arquivo de imagem.'); return; }

    this.enviandoFoto.set(true);
    const pronta = await reduzirImagem(file, 512, 0.85);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(pronta.type)) {
      this.enviandoFoto.set(false);
      this.toast.show('Formato não suportado. Use JPG, PNG ou WEBP.');
      return;
    }
    if (pronta.size > 2 * 1024 * 1024) {
      this.enviandoFoto.set(false);
      this.toast.show('A foto é muito grande. Escolha outra.');
      return;
    }

    const erro = await this.store.enviarAvatar(p, pronta);
    this.enviandoFoto.set(false);
    if (erro) { this.toast.show(erro); return; }
    this.toast.show('Foto atualizada!');
    await this.recarregar();
  }

  async removerFoto() {
    const p = this.perfil();
    if (!p) return;
    const erro = await this.store.removerAvatar(p);
    this.fecharSheet();
    if (erro) { this.toast.show(erro); return; }
    this.toast.show('Foto removida.');
    await this.recarregar();
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

  async sair() {
    await this.store.signOut();
    this.router.navigate(['/']);
  }
}