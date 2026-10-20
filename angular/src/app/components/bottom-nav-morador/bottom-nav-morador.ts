import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bottom-nav-morador',
  imports: [RouterLink],
  templateUrl: './bottom-nav-morador.html',
  styleUrl: './bottom-nav-morador.css',
})
export class BottomNavMorador {
  active = input.required<'inicio' | 'ocorrencias' | 'reservas' | 'perfil'>();
}