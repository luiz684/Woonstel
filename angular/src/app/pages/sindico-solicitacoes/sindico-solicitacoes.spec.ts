import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SindicoSolicitacoes } from './sindico-solicitacoes';

describe('SindicoSolicitacoes', () => {
  let component: SindicoSolicitacoes;
  let fixture: ComponentFixture<SindicoSolicitacoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SindicoSolicitacoes],
    }).compileComponents();

    fixture = TestBed.createComponent(SindicoSolicitacoes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
