import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Convite } from './convite';

describe('Convite', () => {
  let component: Convite;
  let fixture: ComponentFixture<Convite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Convite],
    }).compileComponents();

    fixture = TestBed.createComponent(Convite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
