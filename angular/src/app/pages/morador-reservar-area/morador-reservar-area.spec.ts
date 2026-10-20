import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoradorReservarArea } from './morador-reservar-area';

describe('MoradorReservarArea', () => {
  let component: MoradorReservarArea;
  let fixture: ComponentFixture<MoradorReservarArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoradorReservarArea],
    }).compileComponents();

    fixture = TestBed.createComponent(MoradorReservarArea);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
