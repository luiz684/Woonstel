import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Aviso, StoreService } from '../../services/store';
import { formatDateBR } from '../../utils/format';
import { BottomNavMorador } from '../../components/bottom-nav-morador/bottom-nav-morador';

@Component({
  selector: 'app-morador-avisos',
  imports: [RouterLink, BottomNavMorador],
  templateUrl: './morador-avisos.html',
  styleUrl: './morador-avisos.css',
})
export class MoradorAvisos implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);

  avisos = signal<Aviso[]>([]);
  private lidoAte = 0;
  data = formatDateBR;

  async ngOnInit() {
    const p = await this.store.requireProfile('condomino');
    if (!p) { this.router.navigate(['/']); return; }

    this.lidoAte = p.avisos_lidos_ate ? new Date(p.avisos_lidos_ate).getTime() : 0;
    this.avisos.set(await this.store.getAvisos(p.condominio_id));

    
    await this.store.marcarAvisosLidos(p.id);
  }

  novo(a: Aviso): boolean {
    return new Date(a.created_at).getTime() > this.lidoAte;
  }
}