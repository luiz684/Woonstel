import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './services/toast';
import { PreferenciasService } from './services/preferencias';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  toast = inject(ToastService);

  constructor() {
    inject(PreferenciasService).iniciar();
  }
}