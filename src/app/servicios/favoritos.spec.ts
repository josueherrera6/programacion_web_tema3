import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FavoritosServicio } from './favoritos';
import { environment } from '../../environments/environment';

describe('FavoritosServicio', () => {
  let servicio: FavoritosServicio;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    servicio = TestBed.inject(FavoritosServicio);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe normalizar una respuesta singular de favoritos a un arreglo', () => {
    const producto = {
      id: 7,
      nombre: 'Ratón',
      descripcion: 'Ratón inalámbrico',
      precio: 420,
      categoria_id: 2
    };

    let resultado: any[] = [];

    servicio.obtenerFavoritos().subscribe((productos) => {
      resultado = productos;
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/favoritos`);
    expect(req.request.method).toBe('GET');
    req.flush(producto);

    expect(resultado).toEqual([producto]);
  });

  it('debe enviar un POST para agregar un favorito', () => {
    servicio.agregarFavorito(7).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/favoritos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ producto_id: 7 });
    req.flush({ ok: true });
  });
});
