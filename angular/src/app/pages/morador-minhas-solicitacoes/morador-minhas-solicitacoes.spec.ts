import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoradorMinhasSolicitacoes } from './morador-minhas-solicitacoes';

describe('MoradorMinhasSolicitacoes', () => {
  let component: MoradorMinhasSolicitacoes;
  let fixture: ComponentFixture<MoradorMinhasSolicitacoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoradorMinhasSolicitacoes],
    }).compileComponents();

    fixture = TestBed.createComponent(MoradorMinhasSolicitacoes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
