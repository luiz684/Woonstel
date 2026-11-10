import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoradorNotificacoes } from './morador-notificacoes';

describe('MoradorNotificacoes', () => {
  let component: MoradorNotificacoes;
  let fixture: ComponentFixture<MoradorNotificacoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoradorNotificacoes],
    }).compileComponents();

    fixture = TestBed.createComponent(MoradorNotificacoes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
