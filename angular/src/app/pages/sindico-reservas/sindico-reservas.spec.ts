import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SindicoReservas } from './sindico-reservas';

describe('SindicoReservas', () => {
  let component: SindicoReservas;
  let fixture: ComponentFixture<SindicoReservas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SindicoReservas],
    }).compileComponents();

    fixture = TestBed.createComponent(SindicoReservas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
