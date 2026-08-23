/**
 * ============================================================
 * TAP TERMINAL
 * PRUEBAS UNITARIAS DEL SERVICIO DE PRODUCTOS
 * ============================================================
 *
 * Archivo:
 * product.service.spec.ts
 *
 * Tipo:
 * FRONTEND - Angular / TypeScript / Jasmine
 *
 * Responsabilidad:
 *
 * Verificar el funcionamiento de ProductService.
 *
 * En estas pruebas NO utilizamos el servidor Laravel real.
 *
 * Utilizamos:
 *
 * HttpClientTesting
 *
 * para interceptar y simular las peticiones HTTP.
 *
 * Pruebas realizadas:
 *
 * 1. Crear el servicio.
 * 2. Obtener todos los productos.
 * 3. Obtener un producto por ID.
 * 4. Crear un producto.
 * 5. Actualizar un producto.
 * 6. Eliminar un producto.
 *
 * ============================================================
 */


/* ============================================================
   IMPORTACIONES
   ============================================================ */

import {
  TestBed
} from '@angular/core/testing';


/**
 * HttpClient utilizado por ProductService.
 *
 * provideHttpClient() registra HttpClient
 * dentro del entorno de pruebas.
 */
import {
  provideHttpClient
} from '@angular/common/http';


/**
 * Herramientas para realizar pruebas HTTP.
 *
 * Permite interceptar las peticiones sin comunicarnos
 * realmente con Laravel.
 */
import {
  provideHttpClientTesting,
  HttpTestingController
} from '@angular/common/http/testing';


/**
 * Modelo Product.
 *
 * Se utiliza para tipar los productos utilizados
 * durante las pruebas.
 */
import {
  Product
} from '../models/product';


/**
 * Servicio que estamos probando.
 */
import {
  ProductService
} from './product.service';


/**
 * ============================================================
 * SUITE PRINCIPAL
 * ============================================================
 */

describe('ProductService', () => {


  /**
   * Instancia del servicio que vamos a probar.
   */
  let service: ProductService;


  /**
   * HttpTestingController permite controlar las peticiones
   * HTTP realizadas por ProductService.
   */
  let httpTesting: HttpTestingController;


  /**
   * ==========================================================
   * CONFIGURACIÓN ANTES DE CADA PRUEBA
   * ==========================================================
   *
   * Esta sección se ejecuta antes de cada prueba.
   *
   * Configuramos:
   *
   * - HttpClient
   * - HttpClientTesting
   * - ProductService
   */
  beforeEach(() => {


    TestBed.configureTestingModule({

      providers: [

        /**
         * Proporciona HttpClient.
         */
        provideHttpClient(),


        /**
         * Sustituye el backend HTTP real por el
         * backend de pruebas.
         */
        provideHttpClientTesting()

      ]

    });


    /**
     * Obtener ProductService desde el inyector
     * de Angular.
     */
    service =
      TestBed.inject(ProductService);


    /**
     * Obtener el controlador de peticiones HTTP.
     */
    httpTesting =
      TestBed.inject(HttpTestingController);

  });


  /**
   * ==========================================================
   * LIMPIEZA DESPUÉS DE CADA PRUEBA
   * ==========================================================
   *
   * verify() comprueba que no hayan quedado peticiones
   * HTTP pendientes.
   *
   * Esto ayuda a detectar pruebas incompletas.
   */
  afterEach(() => {

    httpTesting.verify();

  });


  /**
   * ==========================================================
   * PRUEBA 1
   * ==========================================================
   *
   * Verifica que ProductService pueda crearse correctamente.
   */
  it('should be created', () => {


    expect(
      service
    ).toBeTruthy();

  });


  /**
   * ==========================================================
   * PRUEBA 2
   * ==========================================================
   *
   * Verifica que getProducts() realice una petición:
   *
   * GET /api/products
   *
   * y que ProductService reciba correctamente
   * el arreglo de productos.
   */
  it('should get all products', () => {


    /**
     * Datos simulados que representarán la respuesta
     * enviada normalmente por Laravel.
     */
    const mockProducts: Product[] = [

      {

        id: '1',

        code: 'PROD-001',

        name: 'Válvula de prueba',

        brand: 'TAP',

        price: 250

      },

      {

        id: '2',

        code: 'PROD-002',

        name: 'Bomba de prueba',

        brand: 'TAP',

        price: 450

      }

    ];


    /**
     * Ejecutamos el método que queremos probar.
     */
    service.getProducts().subscribe({

      next: (products) => {

        /**
         * Verificamos que la respuesta recibida
         * sea exactamente la esperada.
         */
        expect(products).toEqual(
          mockProducts
        );

      }

    });


    /**
     * Buscamos la petición HTTP generada.
     */
    const request =
      httpTesting.expectOne(
        'http://127.0.0.1:8000/api/products'
      );


    /**
     * Verificamos que sea una petición GET.
     */
    expect(
      request.request.method
    ).toBe('GET');


    /**
     * Simulamos la respuesta del backend.
     */
    request.flush(
      mockProducts
    );

  });


  /**
   * ==========================================================
   * PRUEBA 3
   * ==========================================================
   *
   * Verifica:
   *
   * GET /api/products/{id}
   *
   * para obtener un producto específico.
   */
  it('should get one product by id', () => {


    /**
     * ID utilizado durante la prueba.
     */
    const productId = '123';


    /**
     * Producto simulado que devolvería Laravel.
     */
    const mockProduct: Product = {

      id: productId,

      code: 'PROD-123',

      name: 'Válvula de prueba',

      brand: 'TAP',

      price: 250

    };


    /**
     * Ejecutamos getProduct().
     */
    service
      .getProduct(productId)
      .subscribe({

        next: (product) => {

          /**
           * Verificamos que el producto recibido
           * sea el esperado.
           */
          expect(product).toEqual(
            mockProduct
          );

        }

      });


    /**
     * Esperamos exactamente una petición
     * hacia el endpoint correspondiente.
     */
    const request =
      httpTesting.expectOne(
        `http://127.0.0.1:8000/api/products/${productId}`
      );


    /**
     * Debe utilizar GET.
     */
    expect(
      request.request.method
    ).toBe('GET');


    /**
     * Simulamos la respuesta de Laravel.
     */
    request.flush(
      mockProduct
    );

  });


  /**
   * ==========================================================
   * PRUEBA 4
   * ==========================================================
   *
   * Verifica la creación de un producto.
   *
   * Método:
   *
   * POST
   *
   * Endpoint:
   *
   * /api/products
   */
  it('should create a product', () => {


    /**
     * Datos que enviará el frontend.
     *
     * El código y el ID NO se envían.
     *
     * Laravel será responsable de generarlos.
     */
    const productData: Product = {

      name: 'Producto nuevo',

      brand: 'TAP',

      price: 350

    };


    /**
     * Producto que simularemos como respuesta
     * del backend.
     */
    const createdProduct: Product = {

      id: '456',

      code: 'PROD-456',

      name: 'Producto nuevo',

      brand: 'TAP',

      price: 350

    };


    /**
     * Ejecutamos createProduct().
     */
    service
      .createProduct(productData)
      .subscribe({

        next: (product) => {

          /**
           * Verificamos que Laravel haya devuelto
           * el producto creado.
           */
          expect(product).toEqual(
            createdProduct
          );

        }

      });


    /**
     * Esperamos la petición POST.
     */
    const request =
      httpTesting.expectOne(
        'http://127.0.0.1:8000/api/products'
      );


    /**
     * Debe ser POST.
     */
    expect(
      request.request.method
    ).toBe('POST');


    /**
     * Verificamos exactamente los datos enviados.
     */
    expect(
      request.request.body
    ).toEqual({

      name: 'Producto nuevo',

      brand: 'TAP',

      price: 350

    });


    /**
     * Simulamos la respuesta del backend.
     */
    request.flush(
      createdProduct
    );

  });


  /**
   * ==========================================================
   * PRUEBA 5
   * ==========================================================
   *
   * Verifica la actualización de un producto.
   *
   * Método:
   *
   * PUT
   *
   * Endpoint:
   *
   * /api/products/{id}
   */
  it('should update a product', () => {


    /**
     * ID del producto que vamos a actualizar.
     */
    const productId = '123';


    /**
     * Información nueva del producto.
     */
    const productData: Product = {

      id: productId,

      name: 'Producto actualizado',

      brand: 'TAP',

      price: 500

    };


    /**
     * Producto que simularemos como respuesta
     * de Laravel después de actualizarlo.
     */
    const updatedProduct: Product = {

      id: productId,

      code: 'PROD-123',

      name: 'Producto actualizado',

      brand: 'TAP',

      price: 500

    };


    /**
     * Ejecutamos updateProduct().
     */
    service
      .updateProduct(
        productId,
        productData
      )
      .subscribe({

        next: (product) => {

          /**
           * Verificamos que el servicio reciba
           * correctamente el producto actualizado.
           */
          expect(product).toEqual(
            updatedProduct
          );

        }

      });


    /**
     * Esperamos la petición HTTP.
     */
    const request =
      httpTesting.expectOne(
        `http://127.0.0.1:8000/api/products/${productId}`
      );


    /**
     * Verificamos que el método HTTP sea PUT.
     */
    expect(
      request.request.method
    ).toBe('PUT');


    /**
     * Verificamos que el ID utilizado en la URL
     * sea el correcto.
     */
    expect(
      request.request.url
    ).toBe(
      `http://127.0.0.1:8000/api/products/${productId}`
    );


    /**
     * Verificamos los datos enviados al backend.
     */
    expect(
      request.request.body
    ).toEqual({

      name: 'Producto actualizado',

      brand: 'TAP',

      price: 500

    });


    /**
     * Simulamos la respuesta exitosa de Laravel.
     */
    request.flush(
      updatedProduct
    );

  });


  /**
   * ==========================================================
   * PRUEBA 6
   * ==========================================================
   *
   * Verifica la eliminación de un producto.
   *
   * Método:
   *
   * DELETE
   *
   * Endpoint:
   *
   * /api/products/{id}
   *
   * Esta prueba comprueba:
   *
   * 1. Que se utilice DELETE.
   * 2. Que se utilice correctamente el ID.
   * 3. Que el servicio complete correctamente
   *    la operación cuando Laravel responde.
   */
  it('should delete a product', () => {


    /**
     * ID del producto que vamos a eliminar.
     */
    const productId = '123';


    /**
     * Ejecutamos deleteProduct().
     *
     * El servicio devuelve Observable<void>,
     * por lo que no esperamos recibir un producto
     * como respuesta.
     */
    service
      .deleteProduct(productId)
      .subscribe({

        /**
         * La operación debe terminar correctamente.
         */
        next: () => {

          /**
           * Si llegamos aquí significa que la petición
           * fue completada sin error.
           */
          expect(true).toBeTrue();

        },

        /**
         * Si ocurre un error, la prueba debe fallar.
         */
        error: (error) => {

          fail(
            `La eliminación produjo un error: ${error}`
          );

        }

      });


    /**
     * Esperamos exactamente una petición DELETE
     * hacia el producto indicado.
     */
    const request =
      httpTesting.expectOne(
        `http://127.0.0.1:8000/api/products/${productId}`
      );


    /**
     * Verificamos que el método HTTP sea DELETE.
     */
    expect(
      request.request.method
    ).toBe('DELETE');


    /**
     * Verificamos que la URL contenga
     * exactamente el ID esperado.
     */
    expect(
      request.request.url
    ).toBe(
      `http://127.0.0.1:8000/api/products/${productId}`
    );


    /**
     * Simulamos una respuesta exitosa del backend.
     *
     * No necesitamos enviar un objeto Product porque
     * deleteProduct() está definido como Observable<void>.
     */
    request.flush(
      null
    );

  });

});