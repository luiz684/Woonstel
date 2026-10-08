import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoradorInicio } from './morador-inicio';

describe('MoradorInicio', () => {
  let component: MoradorInicio;
  let fixture: ComponentFixture<MoradorInicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoradorInicio],
    }).compileComponents();

    fixture = TestBed.createComponent(MoradorInicio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
