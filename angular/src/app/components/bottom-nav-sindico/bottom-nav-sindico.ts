import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bottom-nav-sindico',
  imports: [RouterLink],
  templateUrl: './bottom-nav-sindico.html',
  styleUrl: './bottom-nav-sindico.css',
})
export class BottomNavSindico {
  active = input.required<'inicio' | 'solicitacoes' | 'dashboard' | 'perfil'| 'reservas'>();
}