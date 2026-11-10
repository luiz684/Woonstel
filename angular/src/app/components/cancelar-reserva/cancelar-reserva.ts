import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cancelar-reserva',
  imports: [FormsModule],
  templateUrl: './cancelar-reserva.html',
  styleUrl: './cancelar-reserva.css',
})
export class CancelarReserva {
  motivos = input.required<string[]>();
  salvando = input(false);
  confirmar = output<string>();
  voltar = output<void>();

  escolhido = signal('');
  erro = signal('');
  outro = '';

  escolher(m: string) {
    this.escolhido.set(m);
    this.erro.set('');
  }

  enviar() {
    const m = this.escolhido();
    if (!m) { this.erro.set('Escolha uma justificativa.'); return; }
    if (m === 'Outro') {
      const texto = this.outro.trim();
      if (texto.length < 3) { this.erro.set('Descreva o motivo.'); return; }
      this.confirmar.emit('Outro: ' + texto);
      return;
    }
    this.confirmar.emit(m);
  }
}