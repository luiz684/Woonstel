import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SindicoDashboard } from './sindico-dashboard';

describe('SindicoDashboard', () => {
  let component: SindicoDashboard;
  let fixture: ComponentFixture<SindicoDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SindicoDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(SindicoDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
