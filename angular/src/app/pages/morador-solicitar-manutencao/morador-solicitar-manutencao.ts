import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Profile, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { CATEGORIAS, dataHoraLabel, fotoObrigatoria } from '../../utils/format';
import { reduzirImagem } from '../../utils/imagem';
import { BottomNavMorador } from '../../components/bottom-nav-morador/bottom-nav-morador';

type Origem = 'camera' | 'galeria';

@Component({
  selector: 'app-morador-solicitar-manutencao',
  imports: [FormsModule, RouterLink, BottomNavMorador],
  templateUrl: './morador-solicitar-manutencao.html',
  styleUrl: './morador-solicitar-manutencao.css',
})
export class MoradorSolicitarManutencao implements OnInit, OnDestroy {
  private store = inject(StoreService);
  private router = inject(Router);
  private toast = inject(ToastService);

  private perfil: Profile | null = null;
  private arquivo: File | null = null;
  private fotoOrigem: Origem | null = null;

  salvando = signal(false);
  processandoFoto = signal(false);
  previewUrl = signal<string | null>(null);

  categorias = CATEGORIAS;
  prioridades = ['Baixa', 'Média', 'Alta'];
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
    this.liberarPreview();
  }

  private liberarPreview() {
    const url = this.previewUrl();
    if (url) URL.revokeObjectURL(url);
  }

  async onFoto(e: Event, origem: Origem) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; 
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.toast.show('Escolha um arquivo de imagem.');
      return;
    }

    this.processandoFoto.set(true);
    const pronta = await reduzirImagem(file);
    this.processandoFoto.set(false);

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(pronta.type)) {
      this.toast.show('Formato não suportado. Use JPG, PNG ou WEBP.');
      return;
    }
    if (pronta.size > 5 * 1024 * 1024) {
      this.toast.show('A foto é muito grande. Tente tirar outra.');
      return;
    }

    this.liberarPreview();
    this.arquivo = pronta;
    this.fotoOrigem = origem;
    this.previewUrl.set(URL.createObjectURL(pronta));
  }

  removerFoto() {
    this.liberarPreview();
    this.previewUrl.set(null);
    this.arquivo = null;
    this.fotoOrigem = null;
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
    if (this.obrigatoria && !this.arquivo) {
      this.toast.show('Esta categoria exige uma foto do problema.');
      return;
    }

    this.salvando.set(true);

    let fotoPath: string | null = null;
    if (this.arquivo) {
      fotoPath = await this.store.uploadFotoSolicitacao(this.perfil, this.arquivo);
      if (!fotoPath) {
        this.salvando.set(false);
        this.toast.show('Não foi possível enviar a foto. Tente outra imagem.');
        return;
      }
    }

    const { error } = await this.store.criarSolicitacao(this.perfil, {
      titulo: this.titulo.trim(),
      categoria: this.categoria,
      descricao: this.descricao.trim(),
      localizacao: this.local.trim(),
      prioridade: this.prioridade(),
      fotoPath,
      fotoOrigem: this.fotoOrigem,
      dataLabel: dataHoraLabel(),
    });
    this.salvando.set(false);

    if (error) { this.toast.show(error.message); return; }
    this.toast.show('Solicitação registrada com sucesso!');
    setTimeout(() => this.router.navigate(['/morador/minhas-solicitacoes']), 1000);
  }
}