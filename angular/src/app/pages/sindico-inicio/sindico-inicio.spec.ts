import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SindicoInicio } from './sindico-inicio';

describe('SindicoInicio', () => {
  let component: SindicoInicio;
  let fixture: ComponentFixture<SindicoInicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SindicoInicio],
    }).compileComponents();

    fixture = TestBed.createComponent(SindicoInicio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
