import { Component, computed, input } from '@angular/core';

const ICONES: Record<string, string> = {
  camera: 'M4 8h3l2-3h6l2 3h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1zM12 17a4 4 0 100-8 4 4 0 000 8z',
  imagem: 'M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 16l-5-5L6 20',
  lapis: 'M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16zM14 6l4 4',
  lixeira: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3',
  upload: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  trocar: 'M20 12a8 8 0 01-14.3 4.9M4 12A8 8 0 0118.3 7.1M18 3v4h-4M6 21v-4h4',
  check: 'M5 13l4 4L19 7',
  sino: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',
  paleta: 'M12 3a9 9 0 100 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A3.7 3.7 0 0021 10.7C21 6.4 17 3 12 3zM7.5 11a1 1 0 100-2 1 1 0 000 2zM11 7.5a1 1 0 100-2 1 1 0 000 2zM15.5 8.5a1 1 0 100-2 1 1 0 000 2z',
  acessibilidade: 'M12 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM4 8l8 1 8-1M12 9v5M9 21l3-7 3 7',
  cadeado: 'M6 11h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1zM8 11V7a4 4 0 018 0v4',
  escudo: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
  info: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5M12 8h.01',
  sair: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  'seta-dir': 'M9 6l6 6-6 6',
  'seta-esq': 'M15 18l-6-6 6-6',
  sol: 'M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  lua: 'M21 12.8A8.5 8.5 0 1111.2 3a6.6 6.6 0 009.8 9.8z',
  monitor: 'M3 5h18a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zM8 21h8M12 17v4',
  download: 'M12 4v12M7 11l5 5 5-5M4 20h16',
  raio: 'M13 2L4 14h7l-1 8 9-12h-7z',
  gota: 'M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z',
  tijolos: 'M3 5h18v5H3zM3 14h18v5H3zM10 5v5M14 14v5',
  brilho: 'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
  pontos: 'M5 12h.01M12 12h.01M19 12h.01',
  alerta: 'M12 9v4M12 17h.01M10.3 3.9L2.8 17a1.7 1.7 0 001.5 2.5h15.4a1.7 1.7 0 001.5-2.5L13.7 3.9a1.7 1.7 0 00-3.4 0z',
  video: 'M3 7a2 2 0 012-2h9a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM16 10l5-3v10l-5-3',
  mais: 'M12 5v14M5 12h14',
  fechar: 'M6 6l12 12M18 6L6 18',
  play: 'M7 4l13 8-13 8z',
};

@Component({
  selector: 'app-icone',
  templateUrl: './icone.html',
  styleUrl: './icone.css',
})
export class Icone {
  nome = input.required<string>();
  tamanho = input(20);
  d = computed(() => ICONES[this.nome()] ?? '');
}