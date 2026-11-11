import { Component, computed, input } from '@angular/core';
import { avaliarSenha } from '../../utils/senha';

@Component({
  selector: 'app-regras-senha',
  templateUrl: './regras-senha.html',
  styleUrl: './regras-senha.css',
})
export class RegrasSenha {
  senha = input('');
  regras = computed(() => avaliarSenha(this.senha()));
}