import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoradorSolicitacaoDetalhe } from './morador-solicitacao-detalhe';

describe('MoradorSolicitacaoDetalhe', () => {
  let component: MoradorSolicitacaoDetalhe;
  let fixture: ComponentFixture<MoradorSolicitacaoDetalhe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoradorSolicitacaoDetalhe],
    }).compileComponents();

    fixture = TestBed.createComponent(MoradorSolicitacaoDetalhe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
