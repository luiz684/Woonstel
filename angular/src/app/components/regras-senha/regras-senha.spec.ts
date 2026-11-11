import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegrasSenha } from './regras-senha';

describe('RegrasSenha', () => {
  let component: RegrasSenha;
  let fixture: ComponentFixture<RegrasSenha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegrasSenha],
    }).compileComponents();

    fixture = TestBed.createComponent(RegrasSenha);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
