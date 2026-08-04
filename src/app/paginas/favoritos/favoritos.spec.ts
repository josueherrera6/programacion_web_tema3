import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { FavoritosServicio } from '../../servicios/favoritos';
import { Favoritos } from './favoritos';

describe('Favoritos', () => {
  let component: Favoritos;
  let fixture: ComponentFixture<Favoritos>;
  let favoritosServicio: Partial<FavoritosServicio>;

  beforeEach(async () => {
    favoritosServicio = {
      obtenerFavoritos: () => of([{ id: 1, nombre: 'Teclado', descripcion: 'Compacto', precio: 650, categoria_id: 1 }])
    };

    await TestBed.configureTestingModule({
      imports: [Favoritos],
      providers: [{ provide: FavoritosServicio, useValue: favoritosServicio }],
    }).compileComponents();

    fixture = TestBed.createComponent(Favoritos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load favorites without throwing during change detection', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.favoritos.length).toBe(1);
  });
});
