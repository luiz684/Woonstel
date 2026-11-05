import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SindicoSolicitacaoDetalhe } from './sindico-solicitacao-detalhe';

describe('SindicoSolicitacaoDetalhe', () => {
  let component: SindicoSolicitacaoDetalhe;
  let fixture: ComponentFixture<SindicoSolicitacaoDetalhe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SindicoSolicitacaoDetalhe],
    }).compileComponents();

    fixture = TestBed.createComponent(SindicoSolicitacaoDetalhe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
