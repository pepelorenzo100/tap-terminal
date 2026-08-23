/**
 * ============================================================
 * TAP TERMINAL
 * SERVICIO DE PRODUCTOS
 * ============================================================
 *
 * Archivo:
 * product.service.ts
 *
 * Responsabilidad:
 *
 * Centralizar toda la comunicación HTTP entre Angular
 * y la API REST desarrollada en Laravel.
 *
 * Operaciones:
 *
 * GET     /api/products
 * GET     /api/products/{id}
 * POST    /api/products
 * PUT     /api/products/{id}
 * DELETE  /api/products/{id}
 *
 * ============================================================
 */

import {
  Injectable
} from '@angular/core';


import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';


import {
  Observable,
  catchError,
  throwError
} from 'rxjs';


import {
  Product,
  ProductRequest
} from '../models/product';


/**
 * ============================================================
 * SERVICIO
 * ============================================================
 */

@Injectable({
  providedIn: 'root'
})
export class ProductService {


  /**
   * ==========================================================
   * URL BASE
   * ==========================================================
   */

  private readonly apiUrl =
    'http://127.0.0.1:8000/api/products';


  /**
   * ==========================================================
   * CONSTRUCTOR
   * ==========================================================
   */

  constructor(
    private readonly http: HttpClient
  ) {}


  /**
   * ==========================================================
   * OBTENER TODOS LOS PRODUCTOS
   * ==========================================================
   */

  getProducts(): Observable<Product[]> {

    return this.http
      .get<Product[]>(
        this.apiUrl
      )
      .pipe(
        catchError(
          this.handleError
        )
      );

  }


  /**
   * ==========================================================
   * OBTENER UN PRODUCTO
   * ==========================================================
   */

  getProduct(
    id: string | number
  ): Observable<Product> {

    const productId =
      String(id);

    return this.http
      .get<Product>(
        `${this.apiUrl}/${encodeURIComponent(productId)}`
      )
      .pipe(
        catchError(
          this.handleError
        )
      );

  }


  /**
   * ==========================================================
   * CREAR PRODUCTO
   * ==========================================================
   */

  createProduct(
    product: ProductRequest
  ): Observable<Product> {

    const data: ProductRequest = {

      name:
        product.name.trim(),

      brand:
        product.brand.trim(),

      price:
        Number(product.price)

    };


    return this.http
      .post<Product>(
        this.apiUrl,
        data
      )
      .pipe(
        catchError(
          this.handleError
        )
      );

  }


  /**
   * ==========================================================
   * ACTUALIZAR PRODUCTO
   * ==========================================================
   */

  updateProduct(
    id: string | number,
    product: ProductRequest
  ): Observable<Product> {

    const productId =
      String(id);


    const data: ProductRequest = {

      name:
        product.name.trim(),

      brand:
        product.brand.trim(),

      price:
        Number(product.price)

    };


    return this.http
      .put<Product>(
        `${this.apiUrl}/${encodeURIComponent(productId)}`,
        data
      )
      .pipe(
        catchError(
          this.handleError
        )
      );

  }


  /**
   * ==========================================================
   * ELIMINAR PRODUCTO
   * ==========================================================
   */

  deleteProduct(
    id: string | number
  ): Observable<void> {

    const productId =
      String(id);


    return this.http
      .delete<void>(
        `${this.apiUrl}/${encodeURIComponent(productId)}`
      )
      .pipe(
        catchError(
          this.handleError
        )
      );

  }


  /**
   * ==========================================================
   * MANEJO DE ERRORES
   * ==========================================================
   */

  private handleError(
    error: HttpErrorResponse
  ) {

    let message =
      'Ocurrió un error al comunicarse con el servidor.';


    /**
     * Error de conexión.
     */
    if (error.status === 0) {

      message =
        'No fue posible conectarse con Laravel. ' +
        'Verifica que el backend esté ejecutándose en ' +
        'http://127.0.0.1:8000';

    }


    /**
     * Errores HTTP.
     */
    else {

      switch (error.status) {

        case 400:

          message =
            'La solicitud enviada al servidor no es válida.';

          break;


        case 401:

          message =
            'La sesión no es válida o ha expirado.';

          break;


        case 403:

          message =
            'No tienes permisos para realizar esta operación.';

          break;


        case 404:

          message =
            'El producto solicitado no fue encontrado.';

          break;


        case 422:

          message =
            'Los datos enviados no son válidos.';

          break;


        case 500:

          message =
            'Error interno del servidor Laravel.';

          break;


        default:

          message =
            `Error HTTP ${error.status}: ${error.message}`;

          break;

      }

    }


    console.error(
      'ProductService error:',
      error
    );


    return throwError(
      () => new Error(message)
    );

  }

}