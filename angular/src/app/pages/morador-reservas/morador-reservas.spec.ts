import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoradorReservas } from './morador-reservas';

describe('MoradorReservas', () => {
  let component: MoradorReservas;
  let fixture: ComponentFixture<MoradorReservas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoradorReservas],
    }).compileComponents();

    fixture = TestBed.createComponent(MoradorReservas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
