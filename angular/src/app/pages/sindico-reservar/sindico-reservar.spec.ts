import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SindicoReservar } from './sindico-reservar';

describe('SindicoReservar', () => {
  let component: SindicoReservar;
  let fixture: ComponentFixture<SindicoReservar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SindicoReservar],
    }).compileComponents();

    fixture = TestBed.createComponent(SindicoReservar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
