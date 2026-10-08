import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SindicoCadastrarCondominio } from './sindico-cadastrar-condominio';

describe('SindicoCadastrarCondominio', () => {
  let component: SindicoCadastrarCondominio;
  let fixture: ComponentFixture<SindicoCadastrarCondominio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SindicoCadastrarCondominio],
    }).compileComponents();

    fixture = TestBed.createComponent(SindicoCadastrarCondominio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
