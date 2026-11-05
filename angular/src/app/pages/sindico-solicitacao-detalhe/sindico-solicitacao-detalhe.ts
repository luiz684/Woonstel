import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SolicitacaoDetalhe, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';
import { BADGE_PRIO, BADGE_STATUS, formatDateBR } from '../../utils/format';

@Component({
  selector: 'app-sindico-solicitacao-detalhe',
  imports: [RouterLink],
  templateUrl: './sindico-solicitacao-detalhe.html',
  styleUrl: './sindico-solicitacao-detalhe.css',
})
export class SindicoSolicitacaoDetalhe implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  s = signal<SolicitacaoDetalhe | null>(null);
  fotoUrl = signal<string | null>(null);
  fotoErro = signal(false);
  carregado = signal(false);
  salvando = signal(false);
  badge = BADGE_STATUS;
  prio = BADGE_PRIO;
  data = formatDateBR;

  async ngOnInit() {
    const ctx = await this.store.requireSindico();
    if (!ctx) { this.router.navigate(['/']); return; }
    await this.carregar();
  }

  private async carregar() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    const s = await this.store.getSolicitacao(id);
    this.s.set(s);
    if (s?.foto_path) {
      const url = await this.store.getFotoUrl(s.foto_path);
      this.fotoUrl.set(url);
      this.fotoErro.set(!url);
    }
    this.carregado.set(true);
  }

  async mudarStatus(novo: 'Em andamento' | 'Resolvida') {
    const s = this.s();
    if (!s) return;
    this.salvando.set(true);
    const { data, error } = await this.store.atualizarStatusSolicitacao(s, novo);
    this.salvando.set(false);

    if (error || !data || data.length === 0) {
      this.toast.show('Não foi possível atualizar o status.');
      return;
    }
    this.toast.show('Status atualizado!');
    await this.carregar();
  }
}