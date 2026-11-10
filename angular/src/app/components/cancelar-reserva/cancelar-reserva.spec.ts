import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelarReserva } from './cancelar-reserva';

describe('CancelarReserva', () => {
  let component: CancelarReserva;
  let fixture: ComponentFixture<CancelarReserva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelarReserva],
    }).compileComponents();

    fixture = TestBed.createComponent(CancelarReserva);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
