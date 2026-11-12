import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { StoreService } from '../../services/store';
import { initials } from '../../utils/format';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class Avatar {
  private store = inject(StoreService);

  nome = input.required<string>();
  path = input<string | null>(null);
  tamanho = input<number | null>(null);

  url = signal<string | null>(null);
  iniciais = computed(() => initials(this.nome()));
  fonte = computed(() => { const t = this.tamanho(); return t ? Math.round(t * 0.34) : null; });

  constructor() {
    effect(() => {
      const p = this.path();
      void this.carregar(p);
    });
  }

  private async carregar(p: string | null) {
    if (!p) { this.url.set(null); return; }
    const u = await this.store.getAvatarUrl(p);
    if (this.path() === p) this.url.set(u);
  }
}