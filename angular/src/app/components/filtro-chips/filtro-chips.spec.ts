import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroChips } from './filtro-chips';

describe('FiltroChips', () => {
  let component: FiltroChips;
  let fixture: ComponentFixture<FiltroChips>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltroChips],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltroChips);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
