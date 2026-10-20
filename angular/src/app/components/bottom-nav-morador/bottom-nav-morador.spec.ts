import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomNavMorador } from './bottom-nav-morador';

describe('BottomNavMorador', () => {
  let component: BottomNavMorador;
  let fixture: ComponentFixture<BottomNavMorador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavMorador],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavMorador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
