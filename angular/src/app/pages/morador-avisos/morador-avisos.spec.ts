import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoradorAvisos } from './morador-avisos';

describe('MoradorAvisos', () => {
  let component: MoradorAvisos;
  let fixture: ComponentFixture<MoradorAvisos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoradorAvisos],
    }).compileComponents();

    fixture = TestBed.createComponent(MoradorAvisos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
