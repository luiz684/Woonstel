import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoradorPerfil } from './morador-perfil';

describe('MoradorPerfil', () => {
  let component: MoradorPerfil;
  let fixture: ComponentFixture<MoradorPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoradorPerfil],
    }).compileComponents();

    fixture = TestBed.createComponent(MoradorPerfil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
