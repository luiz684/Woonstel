import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-esqueci-senha',
  imports: [FormsModule, RouterLink],
  templateUrl: './esqueci-senha.html',
  styleUrl: './esqueci-senha.css',
})
export class EsqueciSenha {
  private toast = inject(ToastService);

  email = '';
  enviado = signal(false);

  enviar() {
    if (!this.email.trim()) {
      this.toast.show('Informe um e-mail válido.');
      return;
    }
    this.enviado.set(true);
  }
}