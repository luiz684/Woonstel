import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CondominioCompleto, ConviteMorador, Profile, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { formatCpf } from '../../utils/cpf';
import { dataHoraBR, initials } from '../../utils/format';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';

@Component({
  selector: 'app-sindico-moradores',
  imports: [FormsModule, RouterLink, BottomNavSindico],
  templateUrl: './sindico-moradores.html',
  styleUrl: './sindico-moradores.css',
})
export class SindicoMoradores implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  private cond: CondominioCompleto | null = null;

  moradores = signal<Profile[]>([]);
  convites = signal<ConviteMorador[]>([]);
  modo = signal<'lista' | 'form' | 'criado'>('lista');
  salvando = signal(false);
  confirmandoId = signal<string | null>(null);
  linkAtual = signal('');
  nomeAtual = '';

  nome = '';
  cpf = '';
  email = '';
  apto = '';
  recusadas = signal<Record<string, number>>({});
  notas = signal<Record<string, string>>({});
  editandoNotaId = signal<string | null>(null);
  salvandoNota = signal(false);
  notaTexto = '';
  private sindicoId = '';

  iniciais = initials;
  dataHora = dataHoraBR;

  async ngOnInit() {
    const ctx = await this.store.requireSindico();
    if (!ctx) { this.router.navigate(['/']); return; }
    if (!ctx.cond) { this.router.navigate(['/sindico/cadastrar-condominio']); return; }
    this.cond = ctx.cond;
    this.sindicoId = ctx.perfil.id;
    await this.carregar();
  }

    private async carregar() {
    if (!this.cond) return;
    const [m, c, r, n] = await Promise.all([
      this.store.getMoradores(this.cond.id),
      this.store.getConvites(this.cond.id),
      this.store.getRecusadasPorMorador(this.cond.id),
      this.store.getNotas(this.cond.id),
    ]);
    this.moradores.set(m);
    this.convites.set(c);
    this.recusadas.set(r);
    this.notas.set(n);
  }

  link(token: string): string {
    return `${window.location.origin}/convite/${token}`;
  }

  expirado(c: ConviteMorador): boolean {
    return new Date(c.expira_em) <= new Date();
  }

  onCpf(e: Event) {
    const el = e.target as HTMLInputElement;
    this.cpf = formatCpf(el.value);
    el.value = this.cpf;
  }

  novo() {
    this.nome = '';
    this.cpf = '';
    this.email = '';
    this.apto = '';
    this.confirmandoId.set(null);
    this.modo.set('form');
  }

  async criar() {
    if (!this.nome.trim() || this.cpf.length < 14 || !this.email.trim() || !this.apto.trim()) {
      this.toast.show('Preencha nome, CPF, e-mail e unidade.');
      return;
    }
    this.salvando.set(true);
    const { data, error } = await this.store.criarConvite({
      nome: this.nome.trim(), cpf: this.cpf, email: this.email.trim(), apto: this.apto.trim(),
    });
    this.salvando.set(false);

    if (error || !data) {
      this.toast.show(error?.message ?? 'Não foi possível criar o convite.');
      return;
    }
    this.nomeAtual = this.nome.trim();
    this.linkAtual.set(this.link(data as string));
    this.modo.set('criado');
    await this.carregar();
  }

  voltar() {
    this.modo.set('lista');
  }

  async copiar(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      this.toast.show('Link copiado!');
    } catch {
      this.toast.show('Não foi possível copiar. Selecione o link e copie manualmente.');
    }
  }

  whatsapp(nome: string, link: string) {
    const texto = `Olá, ${nome}! Seu acesso ao Woonstel (${this.cond?.nome ?? 'condomínio'}) foi criado. ` +
      `Defina sua senha por este link (vale por 7 dias): ${link}`;
    window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
  }

  async renovar(c: ConviteMorador) {
    const { data, error } = await this.store.renovarConvite(c.id);
    if (error || !data) { this.toast.show(error?.message ?? 'Não foi possível renovar.'); return; }
    this.nomeAtual = c.nome;
    this.linkAtual.set(this.link(data as string));
    this.modo.set('criado');
    await this.carregar();
  }

  pedirConfirmacao(id: string) {
    this.confirmandoId.set(id);
  }

  async cancelarConvite(c: ConviteMorador) {
    const { error } = await this.store.cancelarConvite(c.id);
    if (error) { this.toast.show(error.message); return; }
    this.confirmandoId.set(null);
    this.toast.show('Convite cancelado.');
    await this.carregar();
  }

  async alternarAcesso(m: Profile) {
    const { error } = await this.store.definirAcessoMorador(m.id, !m.ativo);
    if (error) { this.toast.show(error.message); return; }
    this.confirmandoId.set(null);
    this.toast.show(m.ativo ? 'Acesso desativado.' : 'Acesso reativado.');
    await this.carregar();
  }

    abrirNota(m: Profile) {
    this.confirmandoId.set(null);
    this.notaTexto = this.notas()[m.id] ?? '';
    this.editandoNotaId.set(m.id);
  }

  fecharNota() {
    this.editandoNotaId.set(null);
  }

  async salvarNota(m: Profile) {
    if (!this.cond) return;
    this.salvandoNota.set(true);
    const { error } = await this.store.salvarNota(this.cond.id, m.id, this.sindicoId, this.notaTexto);
    this.salvandoNota.set(false);
    if (error) { this.toast.show('Não foi possível salvar a anotação: ' + error.message); return; }
    this.editandoNotaId.set(null);
    this.toast.show('Anotação salva.');
    await this.carregar();
  }
}