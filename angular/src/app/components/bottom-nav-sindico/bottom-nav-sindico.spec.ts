import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomNavSindico } from './bottom-nav-sindico';

describe('BottomNavSindico', () => {
  let component: BottomNavSindico;
  let fixture: ComponentFixture<BottomNavSindico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavSindico],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavSindico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
