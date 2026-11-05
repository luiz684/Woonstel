import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SindicoMoradores } from './sindico-moradores';

describe('SindicoMoradores', () => {
  let component: SindicoMoradores;
  let fixture: ComponentFixture<SindicoMoradores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SindicoMoradores],
    }).compileComponents();

    fixture = TestBed.createComponent(SindicoMoradores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
