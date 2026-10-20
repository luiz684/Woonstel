import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoradorSolicitarManutencao } from './morador-solicitar-manutencao';

describe('MoradorSolicitarManutencao', () => {
  let component: MoradorSolicitarManutencao;
  let fixture: ComponentFixture<MoradorSolicitarManutencao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoradorSolicitarManutencao],
    }).compileComponents();

    fixture = TestBed.createComponent(MoradorSolicitarManutencao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
