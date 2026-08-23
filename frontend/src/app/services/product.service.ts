/**
 * ============================================================
 * TAP TERMINAL
 * MÓDULO DE ADMINISTRACIÓN DE PRODUCTOS
 * ============================================================
 *
 * Archivo:
 * product.service.ts
 *
 * Tipo:
 * FRONTEND - Angular / TypeScript
 *
 * Responsabilidad:
 *
 * Este servicio centraliza toda la comunicación HTTP entre
 * el frontend Angular y la API REST desarrollada en Laravel.
 *
 * Operaciones disponibles:
 *
 * 1. Obtener todos los productos.
 * 2. Obtener un producto por ID.
 * 3. Crear un producto.
 * 4. Actualizar un producto.
 * 5. Eliminar un producto.
 * 6. Centralizar el manejo de errores HTTP.
 *
 * Arquitectura:
 *
 * ProductsComponent
 *       ↓
 * ProductService
 *       ↓
 * HttpClient
 *       ↓
 * Laravel API
 *       ↓
 * Base de datos
 *
 * ============================================================
 */


/**
 * ============================================================
 * IMPORTACIONES DE ANGULAR
 * ============================================================
 */

/**
 * Injectable permite registrar esta clase como un servicio
 * administrado por el sistema de inyección de dependencias
 * de Angular.
 */
import { Injectable } from '@angular/core';


/**
 * HttpClient permite realizar peticiones HTTP:
 *
 * GET
 * POST
 * PUT
 * DELETE
 *
 * HttpErrorResponse representa los errores producidos
 * durante una petición HTTP.
 */
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';


/**
 * Observable representa un flujo de datos asíncrono.
 *
 * throwError permite devolver un error dentro del flujo
 * RxJS para que pueda ser recibido por el componente.
 */
import {
  Observable,
  throwError
} from 'rxjs';


/**
 * catchError permite interceptar errores producidos
 * durante una petición HTTP.
 */
import {
  catchError
} from 'rxjs/operators';


/**
 * Modelo utilizado para representar un producto.
 */
import {
  Product
} from '../models/product';


/**
 * ============================================================
 * SERVICIO DE PRODUCTOS
 * ============================================================
 *
 * providedIn: 'root'
 *
 * Significa que Angular registra automáticamente este servicio
 * como un singleton disponible en toda la aplicación.
 *
 * No necesitamos agregar manualmente el servicio a un módulo.
 *
 * ============================================================
 */

@Injectable({

  providedIn: 'root'

})


export class ProductService {


  /**
   * ==========================================================
   * URL BASE DE LA API
   * ==========================================================
   *
   * Esta constante contiene el endpoint principal utilizado
   * para administrar productos.
   *
   * Backend Laravel:
   *
   * http://127.0.0.1:8000
   *
   * Endpoint:
   *
   * http://127.0.0.1:8000/api/products
   *
   * readonly significa que el valor no debe cambiar
   * durante la ejecución del servicio.
   *
   * ==========================================================
   */

  private readonly apiUrl =
    'http://127.0.0.1:8000/api/products';


  /**
   * ==========================================================
   * CONSTRUCTOR
   * ==========================================================
   *
   * Angular inyecta automáticamente una instancia de
   * HttpClient.
   *
   * HttpClient es el encargado de realizar las peticiones
   * HTTP hacia Laravel.
   *
   * Ejemplo:
   *
   * this.http.get(...)
   * this.http.post(...)
   * this.http.put(...)
   * this.http.delete(...)
   *
   * ==========================================================
   */

  constructor(

    private readonly http: HttpClient

  ) {}


  /**
   * ==========================================================
   * OBTENER TODOS LOS PRODUCTOS
   * ==========================================================
   *
   * Método:
   *
   * GET
   *
   * Endpoint:
   *
   * /api/products
   *
   * Ejemplo completo:
   *
   * http://127.0.0.1:8000/api/products
   *
   * Retorno:
   *
   * Observable<Product[]>
   *
   * Esto significa que esperamos recibir un arreglo
   * de objetos Product.
   *
   * ==========================================================
   */

  getProducts(): Observable<Product[]> {


    /**
     * Realizamos una petición GET al endpoint.
     *
     * <Product[]>
     *
     * indica a TypeScript que esperamos recibir
     * un arreglo de productos.
     */

    return this.http

      .get<Product[]>(this.apiUrl)

      .pipe(

        /**
         * Si ocurre un error, lo enviamos al método
         * centralizado de manejo de errores.
         */

        catchError(this.handleError)

      );

  }


  /**
   * ==========================================================
   * OBTENER UN PRODUCTO
   * ==========================================================
   *
   * Método:
   *
   * GET
   *
   * Endpoint:
   *
   * /api/products/{id}
   *
   * Ejemplo:
   *
   * /api/products/123
   *
   * ==========================================================
   */

  getProduct(
    id: string | number
  ): Observable<Product> {


    /**
     * Convertimos el ID a string.
     *
     * Esto permite aceptar tanto:
     *
     * string
     *
     * como:
     *
     * number
     */

    const productId = String(id);


    /**
     * encodeURIComponent protege el valor utilizado
     * dentro de la URL.
     *
     * Por ejemplo, si el ID contiene caracteres especiales,
     * estos serán codificados correctamente.
     */

    return this.http

      .get<Product>(

        `${this.apiUrl}/${encodeURIComponent(productId)}`

      )

      .pipe(

        catchError(this.handleError)

      );

  }


  /**
   * ==========================================================
   * CREAR PRODUCTO
   * ==========================================================
   *
   * Método:
   *
   * POST
   *
   * Endpoint:
   *
   * /api/products
   *
   * Datos enviados:
   *
   * {
   *   name: "Producto",
   *   brand: "TAP",
   *   price: 250
   * }
   *
   * ==========================================================
   */

  createProduct(
    product: Product
  ): Observable<Product> {


    /**
     * Construimos el objeto que será enviado al backend.
     *
     * No enviamos necesariamente todo el objeto Product.
     *
     * Enviamos únicamente los datos necesarios para crear
     * el producto.
     */

    const data = {

      /**
       * trim elimina espacios innecesarios al principio
       * y al final del nombre.
       */

      name: product.name.trim(),


      /**
       * trim realiza la misma limpieza para la marca.
       */

      brand: product.brand.trim(),


      /**
       * Number garantiza que el precio sea tratado
       * como valor numérico.
       */

      price: Number(product.price)

    };


    /**
     * Realizamos POST hacia Laravel.
     */

    return this.http

      .post<Product>(

        this.apiUrl,

        data

      )

      .pipe(

        catchError(this.handleError)

      );

  }


  /**
   * ==========================================================
   * ACTUALIZAR PRODUCTO
   * ==========================================================
   *
   * Método:
   *
   * PUT
   *
   * Endpoint:
   *
   * /api/products/{id}
   *
   * Ejemplo:
   *
   * /api/products/ABC123
   *
   * ==========================================================
   */

  updateProduct(

    id: string | number,

    product: Product

  ): Observable<Product> {


    /**
     * Convertimos el identificador a string.
     *
     * Esto permite trabajar con IDs recibidos como:
     *
     * string
     *
     * o
     *
     * number
     */

    const productId = String(id);


    /**
     * Construimos los datos que serán enviados
     * a Laravel.
     */

    const data = {

      name: product.name.trim(),

      brand: product.brand.trim(),

      price: Number(product.price)

    };


    /**
     * Realizamos la petición PUT.
     *
     * encodeURIComponent evita problemas si el ID
     * contiene caracteres especiales.
     */

    return this.http

      .put<Product>(

        `${this.apiUrl}/${encodeURIComponent(productId)}`,

        data

      )

      .pipe(

        catchError(this.handleError)

      );

  }


  /**
   * ==========================================================
   * ELIMINAR PRODUCTO
   * ==========================================================
   *
   * Método:
   *
   * DELETE
   *
   * Endpoint:
   *
   * /api/products/{id}
   *
   * ==========================================================
   */

  deleteProduct(

    id: string | number

  ): Observable<void> {


    /**
     * Convertimos el identificador a string.
     */

    const productId = String(id);


    /**
     * Ejecutamos la petición DELETE.
     *
     * El componente solamente necesita saber si
     * la operación terminó correctamente o produjo
     * un error.
     */

    return this.http

      .delete<void>(

        `${this.apiUrl}/${encodeURIComponent(productId)}`

      )

      .pipe(

        catchError(this.handleError)

      );

  }


  /**
   * ==========================================================
   * MANEJO CENTRALIZADO DE ERRORES
   * ==========================================================
   *
   * Todos los métodos HTTP utilizan este método mediante:
   *
   * catchError(this.handleError)
   *
   * Esto evita tener que repetir la misma lógica
   * de manejo de errores en cada petición.
   *
   * ==========================================================
   */

  private handleError(

    error: HttpErrorResponse

  ) {


    /**
     * Mensaje genérico.
     *
     * Si ningún caso específico coincide,
     * utilizaremos este mensaje.
     */

    let message =
      'Ocurrió un error al comunicarse con el servidor.';


    /**
     * ========================================================
     * ERROR DE RED / CONEXIÓN
     * ========================================================
     *
     * status === 0 normalmente indica que la petición
     * no pudo completarse porque no hubo comunicación
     * HTTP con el servidor.
     *
     * En nuestro entorno local puede ocurrir si Laravel
     * no está ejecutándose.
     */

    if (error.status === 0) {


      message =

        'No fue posible conectarse con Laravel. ' +

        'Verifica que el backend esté ejecutándose en ' +

        'http://127.0.0.1:8000';

    }


    /**
     * ========================================================
     * ERRORES HTTP
     * ========================================================
     *
     * Si recibimos una respuesta HTTP, analizamos
     * específicamente el código de estado.
     */

    else {


      switch (error.status) {


        /**
         * ----------------------------------------------------
         * HTTP 400
         * ----------------------------------------------------
         *
         * Bad Request.
         *
         * La solicitud enviada al servidor no cumple
         * con lo esperado.
         */

        case 400:

          message =
            'La solicitud enviada al servidor no es válida.';

          break;


        /**
         * ----------------------------------------------------
         * HTTP 404
         * ----------------------------------------------------
         *
         * Not Found.
         *
         * El recurso solicitado no fue encontrado.
         */

        case 404:

          message =
            'El producto solicitado no fue encontrado.';

          break;


        /**
         * ----------------------------------------------------
         * HTTP 422
         * ----------------------------------------------------
         *
         * Unprocessable Entity.
         *
         * Laravel normalmente utiliza este código cuando
         * los datos enviados no pasan las reglas de validación.
         */

        case 422:

          message =
            'Los datos enviados no son válidos.';

          break;


        /**
         * ----------------------------------------------------
         * HTTP 500
         * ----------------------------------------------------
         *
         * Internal Server Error.
         *
         * Indica un error interno en el backend.
         */

        case 500:

          message =
            'Error interno del servidor Laravel.';

          break;


        /**
         * ----------------------------------------------------
         * OTROS CÓDIGOS HTTP
         * ----------------------------------------------------
         */

        default:

          message =
            `Error HTTP ${error.status}: ${error.message}`;

          break;

      }

    }


    /**
     * ========================================================
     * CONSOLA DEL NAVEGADOR
     * ========================================================
     *
     * Registramos el error completo para facilitar
     * el diagnóstico durante desarrollo.
     */

    console.error(

      'ProductService error:',

      error

    );


    /**
     * ========================================================
     * DEVOLVER ERROR AL COMPONENTE
     * ========================================================
     *
     * throwError crea un Observable que termina
     * con error.
     *
     * El componente puede recibirlo mediante:
     *
     * error: (error) => { ... }
     *
     * De esta manera ProductService se encarga de
     * interpretar el error y ProductsComponent decide
     * qué mensaje mostrar al usuario.
     */

    return throwError(

      () => new Error(message)

    );

  }

}