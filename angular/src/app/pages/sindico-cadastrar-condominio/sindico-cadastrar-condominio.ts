import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CondominioCompleto, Profile, StoreService } from '../../services/store';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-sindico-cadastrar-condominio',
  imports: [FormsModule, RouterLink],
  templateUrl: './sindico-cadastrar-condominio.html',
  styleUrl: './sindico-cadastrar-condominio.css',
})
export class SindicoCadastrarCondominio implements OnInit {
  private store = inject(StoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  private perfil: Profile | null = null;
  private existente: CondominioCompleto | null = null;

  onboarding = this.route.snapshot.queryParamMap.get('onboarding') === '1';
  editando = signal(false);
  salvando = signal(false);

  nome = '';
  endereco = '';
  unidades: number | null = null;
  blocos: number | null = null;

  async ngOnInit() {
    this.perfil = await this.store.requireProfile('sindico');
    if (!this.perfil) { this.router.navigate(['/']); return; }

    this.existente = await this.store.getCondominioDoSindico(this.perfil.id);
    if (this.existente && !this.onboarding) {
      this.nome = this.existente.nome;
      this.endereco = this.existente.endereco ?? '';
      this.unidades = this.existente.unidades;
      this.blocos = this.existente.blocos;
      this.editando.set(true);
    }
  }

  async salvar() {
    if (!this.perfil) return;
    if (!this.nome.trim() || !this.endereco.trim() || !this.unidades || !this.blocos) {
      this.toast.show('Preencha todos os campos.');
      return;
    }

    this.salvando.set(true);
    const dados = {
      nome: this.nome.trim(),
      endereco: this.endereco.trim(),
      unidades: Number(this.unidades),
      blocos: Number(this.blocos),
    };

    const { error } = this.existente
      ? await this.store.atualizarCondominio(this.existente.id, dados)
      : await this.store.criarCondominio({ ...dados, sindicoId: this.perfil.id });
    this.salvando.set(false);

    if (error) {
      this.toast.show('Erro ao salvar: ' + error.message);
      return;
    }
    this.toast.show('Condomínio salvo com sucesso!');
    setTimeout(() => this.router.navigate(['/sindico/inicio']), 900);
  }
}