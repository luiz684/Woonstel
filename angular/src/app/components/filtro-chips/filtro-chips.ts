import { Component, input, model } from '@angular/core';

export interface OpcaoFiltro { valor: string; qtd: number; }

@Component({
  selector: 'app-filtro-chips',
  templateUrl: './filtro-chips.html',
  styleUrl: './filtro-chips.css',
})
export class FiltroChips {
  opcoes = input.required<OpcaoFiltro[]>();
  valor = model.required<string>();
}