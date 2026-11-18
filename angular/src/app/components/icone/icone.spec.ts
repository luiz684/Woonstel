import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Icone } from './icone';

describe('Icone', () => {
  let component: Icone;
  let fixture: ComponentFixture<Icone>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Icone],
    }).compileComponents();

    fixture = TestBed.createComponent(Icone);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
