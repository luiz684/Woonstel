import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BottomNavSindico } from '../../components/bottom-nav-sindico/bottom-nav-sindico';
import { PerfilForm } from '../../components/perfil-form/perfil-form';

@Component({
  selector: 'app-sindico-perfil',
  imports: [RouterLink, BottomNavSindico, PerfilForm],
  templateUrl: './sindico-perfil.html',
  styleUrl: './sindico-perfil.css',
})
export class SindicoPerfil {}