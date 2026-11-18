import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Anexo, Profile, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { CATEGORIAS, dataHoraLabel, fotoObrigatoria } from '../../utils/format';
import { reduzirImagem } from '../../utils/imagem';
import { BottomNavMorador } from '../../components/bottom-nav-morador/bottom-nav-morador';
import { Icone } from '../../components/icone/icone';

type Origem = 'camera' | 'galeria';

interface Item {
  id: number;
  file: File;
  tipo: 'foto' | 'video';
  origem: Origem;
  url: string;
}

const MAX_ANEXOS = 4;
const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const TIPOS_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];

@Component({
  selector: 'app-morador-solicitar-manutencao',
  imports: [FormsModule, RouterLink, BottomNavMorador, Icone],
  templateUrl: './morador-solicitar-manutencao.html',
  styleUrl: './morador-solicitar-manutencao.css',
})
export class MoradorSolicitarManutencao implements OnInit, OnDestroy {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  private perfil: Profile | null = null;
  private seq = 0;

  max = MAX_ANEXOS;
  itens = signal<Item[]>([]);
  sheet = signal(false);
  salvando = signal(false);
  processando = signal(false);

  categorias = CATEGORIAS;
  prioridades = ['Baixa', 'Média', 'Alta'];
  cores: Record<string, string> = { Baixa: '#22C55E', 'Média': '#F59E0B', Alta: '#EF4444' };
  prioridade = signal('Média');

  titulo = '';
  categoria = 'Elétrica';
  descricao = '';
  local = '';

  get obrigatoria(): boolean {
    return fotoObrigatoria(this.categoria);
  }

  async ngOnInit() {
    this.perfil = await this.store.requireProfile('condomino');
    if (!this.perfil) this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.itens().forEach(i => URL.revokeObjectURL(i.url));
  }

  @HostListener('document:keydown.escape')
  aoEsc() {
    this.sheet.set(false);
  }

  async onArquivos(e: Event, origem: Origem) {
    const input = e.target as HTMLInputElement;
    const arquivos = Array.from(input.files ?? []);
    input.value = '';
    for (const f of arquivos) await this.adicionar(f, origem);
  }

  private async adicionar(file: File, origem: Origem) {
    if (this.itens().length >= MAX_ANEXOS) {
      this.toast.show(`O máximo é ${MAX_ANEXOS} arquivos.`);
      return;
    }

    if (file.type.startsWith('video/')) {
      if (this.itens().some(i => i.tipo === 'video')) { this.toast.show('Só é possível anexar 1 vídeo.'); return; }
      if (!TIPOS_VIDEO.includes(file.type)) { this.toast.show('Formato de vídeo não suportado. Use MP4, WEBM ou MOV.'); return; }
      if (file.size > 25 * 1024 * 1024) { this.toast.show('O vídeo passa de 25 MB. Grave um mais curto.'); return; }
      this.incluir(file, 'video', origem);
      return;
    }

    if (!file.type.startsWith('image/')) { this.toast.show('Escolha uma foto ou um vídeo.'); return; }

    this.processando.set(true);
    const pronta = await reduzirImagem(file);
    this.processando.set(false);

    if (!TIPOS_FOTO.includes(pronta.type)) { this.toast.show('Formato não suportado. Use JPG, PNG ou WEBP.'); return; }
    if (pronta.size > 5 * 1024 * 1024) { this.toast.show('A foto é muito grande. Tente outra.'); return; }
    this.incluir(pronta, 'foto', origem);
  }

  private incluir(file: File, tipo: 'foto' | 'video', origem: Origem) {
    this.itens.update(l => [...l, { id: ++this.seq, file, tipo, origem, url: URL.createObjectURL(file) }]);
  }

  remover(item: Item) {
    URL.revokeObjectURL(item.url);
    this.itens.update(l => l.filter(i => i.id !== item.id));
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
    if (this.obrigatoria && this.itens().length === 0) {
      this.toast.show('Esta categoria exige uma foto ou vídeo do problema.');
      return;
    }

    this.salvando.set(true);

    const enviados: Anexo[] = [];
    for (const it of this.itens()) {
      const path = await this.store.uploadFotoSolicitacao(this.perfil, it.file);
      if (!path) {
        await this.store.removerArquivosSolicitacao(enviados.map(a => a.path));
        this.salvando.set(false);
        this.toast.show('Não foi possível enviar os arquivos. Tente novamente.');
        return;
      }
      enviados.push({ path, tipo: it.tipo, origem: it.origem });
    }

    const { error } = await this.store.criarSolicitacao(this.perfil, {
      titulo: this.titulo.trim(),
      categoria: this.categoria,
      descricao: this.descricao.trim(),
      localizacao: this.local.trim(),
      prioridade: this.prioridade(),
      anexos: enviados,
      dataLabel: dataHoraLabel(),
    });

    if (error) {
      await this.store.removerArquivosSolicitacao(enviados.map(a => a.path));
      this.salvando.set(false);
      this.toast.show(error.message);
      return;
    }

    this.salvando.set(false);
    this.toast.show('Solicitação registrada com sucesso!');
    setTimeout(() => this.router.navigate(['/morador/minhas-solicitacoes']), 1000);
  }
}