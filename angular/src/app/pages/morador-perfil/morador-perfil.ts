import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BottomNavMorador } from '../../components/bottom-nav-morador/bottom-nav-morador';
import { PerfilForm } from '../../components/perfil-form/perfil-form';


@Component({
  selector: 'app-morador-perfil',
  imports: [RouterLink, BottomNavMorador, PerfilForm],
  templateUrl: './morador-perfil.html',
  styleUrl: './morador-perfil.css',
})
export class MoradorPerfil {}