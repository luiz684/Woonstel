import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SindicoPerfil } from './sindico-perfil';

describe('SindicoPerfil', () => {
  let component: SindicoPerfil;
  let fixture: ComponentFixture<SindicoPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SindicoPerfil],
    }).compileComponents();

    fixture = TestBed.createComponent(SindicoPerfil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
