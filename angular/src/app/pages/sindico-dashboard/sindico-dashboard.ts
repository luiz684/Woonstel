import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';

interface Barra { rotulo: string; valor: number; pct: number; }

function montar(contagem: Map<string, number>, ordenar: boolean): Barra[] {
  const max = Math.max(1, ...contagem.values());
  let lista = [...contagem.entries()].map(([rotulo, valor]) => ({
    rotulo, valor, pct: Math.round((valor / max) * 100),
  }));
  if (ordenar) lista = lista.sort((a, b) => b.valor - a.valor);
  return lista;
}

@Component({
  selector: 'app-sindico-dashboard',
  imports: [RouterLink, BottomNavSindico],
  templateUrl: './sindico-dashboard.html',
  styleUrl: './sindico-dashboard.css',
})
export class SindicoDashboard implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);

  pendentes = signal(0);
  resolvidas = signal(0);
  moradores = signal(0);
  reservasMes = signal(0);
  porStatus = signal<Barra[]>([]);
  porCategoria = signal<Barra[]>([]);
  porArea = signal<Barra[]>([]);

  async ngOnInit() {
    const ctx = await this.store.requireSindico();
    if (!ctx) { this.router.navigate(['/']); return; }
    if (!ctx.cond) { this.router.navigate(['/sindico/cadastrar-condominio']); return; }

    const [sols, reservas, moradores] = await Promise.all([
      this.store.getSolicitacoesDoCondominio(ctx.cond.id),
      this.store.getReservasDoCondominio(ctx.cond.id),
      this.store.countMoradores(ctx.cond.id),
    ]);

    this.pendentes.set(sols.filter(s => s.status === 'Pendente').length);
    this.resolvidas.set(sols.filter(s => s.status === 'Resolvida').length);
    this.moradores.set(moradores);

    
    const hoje = new Date();
    const ym = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');
    this.reservasMes.set(reservas.filter(r => r.status === 'Confirmada' && r.data.startsWith(ym)).length);

    const status = new Map<string, number>([['Pendente', 0], ['Em andamento', 0], ['Resolvida', 0], ['Recusada', 0]]);
    const categorias = new Map<string, number>();
    for (const s of sols) {
      status.set(s.status, (status.get(s.status) ?? 0) + 1);
      const c = s.categoria?.trim() || 'Sem categoria';
      categorias.set(c, (categorias.get(c) ?? 0) + 1);
    }
    const areas = new Map<string, number>();
        for (const r of reservas) {
      if (r.status !== 'Confirmada') continue;
      const a = r.area_nome?.trim() || 'Sem área';
      areas.set(a, (areas.get(a) ?? 0) + 1);
    }

    this.porStatus.set(montar(status, false));
    this.porCategoria.set(montar(categorias, true));
    this.porArea.set(montar(areas, true));
  }
}