import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SindicoAreas } from './sindico-areas';

describe('SindicoAreas', () => {
  let component: SindicoAreas;
  let fixture: ComponentFixture<SindicoAreas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SindicoAreas],
    }).compileComponents();

    fixture = TestBed.createComponent(SindicoAreas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
