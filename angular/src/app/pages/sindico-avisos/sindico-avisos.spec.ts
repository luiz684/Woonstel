import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SindicoAvisos } from './sindico-avisos';

describe('SindicoAvisos', () => {
  let component: SindicoAvisos;
  let fixture: ComponentFixture<SindicoAvisos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SindicoAvisos],
    }).compileComponents();

    fixture = TestBed.createComponent(SindicoAvisos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
