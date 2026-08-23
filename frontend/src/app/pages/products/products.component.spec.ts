/**
 * ============================================================
 * TAP TERMINAL
 * PRUEBAS UNITARIAS DEL COMPONENTE DE PRODUCTOS
 * ============================================================
 *
 * Archivo:
 * products.component.spec.ts
 *
 * Tipo:
 * FRONTEND - Angular / TypeScript / Jasmine
 *
 * Responsabilidad:
 *
 * Verificar el comportamiento principal de ProductsComponent.
 *
 * Pruebas incluidas:
 *
 * 1. Crear componente.
 * 2. Cargar productos.
 * 3. Mostrar formulario de creación.
 * 4. Validar nombre obligatorio.
 * 5. Validar marca obligatoria.
 * 6. Validar precio.
 * 7. Crear producto.
 * 8. Editar producto.
 * 9. Actualizar producto.
 * 10. Visualizar producto.
 * 11. Eliminar producto.
 * 12. Cancelar formulario.
 * 13. Reiniciar formulario.
 * 14. Mostrar mensajes.
 * 15. Exportar Excel.
 * 16. Exportar PDF.
 *
 * ============================================================
 */


/* ============================================================
   IMPORTACIONES DE ANGULAR TESTING
   ============================================================ */

import {
  TestBed
} from '@angular/core/testing';


/**
 * HttpClient utilizado por ProductService.
 */
import {
  provideHttpClient
} from '@angular/common/http';


/**
 * Infraestructura para interceptar peticiones HTTP
 * durante las pruebas.
 */
import {
  provideHttpClientTesting,
  HttpTestingController
} from '@angular/common/http/testing';


/**
 * Componente que estamos probando.
 */
import {
  ProductsComponent
} from './products.component';


/**
 * Modelo de producto.
 */
import {
  Product
} from '../../models/product';


/**
 * Servicio utilizado por ProductsComponent.
 */
import {
  ProductService
} from '../../services/product.service';


/**
 * ============================================================
 * SUITE PRINCIPAL
 * ============================================================
 */

describe('ProductsComponent', () => {


  /**
   * Instancia del componente.
   */
  let component: ProductsComponent;


  /**
   * Fixture utilizado para controlar el componente
   * y ejecutar detección de cambios.
   */
  let fixture: ReturnType<
    typeof TestBed.createComponent<ProductsComponent>
  >;


  /**
   * Servicio de productos.
   */
  let productService: ProductService;


  /**
   * Controlador de peticiones HTTP.
   */
  let httpTesting: HttpTestingController;


  /**
   * ==========================================================
   * CONFIGURACIÓN
   * ==========================================================
   */

  beforeEach(async () => {

    await TestBed.configureTestingModule({

      imports: [

        ProductsComponent

      ],

      providers: [

        /**
         * Proporciona HttpClient.
         */
        provideHttpClient(),

        /**
         * Permite interceptar las peticiones HTTP.
         */
        provideHttpClientTesting()

      ]

    }).compileComponents();


    /**
     * Crear el componente.
     */
    fixture =
      TestBed.createComponent(
        ProductsComponent
      );


    /**
     * Obtener la instancia del componente.
     */
    component =
      fixture.componentInstance;


    /**
     * Obtener ProductService.
     */
    productService =
      TestBed.inject(
        ProductService
      );


    /**
     * Obtener controlador HTTP.
     */
    httpTesting =
      TestBed.inject(
        HttpTestingController
      );

  });


  /**
   * ==========================================================
   * LIMPIEZA
   * ==========================================================
   *
   * Verifica que no queden peticiones HTTP pendientes.
   */
  afterEach(() => {

    httpTesting.verify();

  });


  /**
   * ==========================================================
   * PRODUCTO DE PRUEBA
   * ==========================================================
   *
   * Función auxiliar para evitar repetir el mismo objeto
   * en todas las pruebas.
   */
  const createMockProduct = (): Product => ({

    id: '123',

    code: 'PROD-123',

    name: 'Válvula de prueba',

    brand: 'TAP',

    price: 250

  });


  /**
   * ==========================================================
   * PRUEBA 1
   * ==========================================================
   *
   * Verifica que el componente pueda crearse.
   */
  it('should create', () => {

    expect(
      component
    ).toBeTruthy();

  });


  /**
   * ==========================================================
   * PRUEBA 2
   * ==========================================================
   *
   * Verifica que loadProducts() obtenga los productos
   * desde Laravel.
   */
  it('should load products', () => {

    const mockProducts: Product[] = [

      createMockProduct(),

      {

        id: '456',

        code: 'PROD-456',

        name: 'Bomba de prueba',

        brand: 'TAP',

        price: 450

      }

    ];


    component.loadProducts();


    const request =
      httpTesting.expectOne(
        'http://127.0.0.1:8000/api/products'
      );


    expect(
      request.request.method
    ).toBe('GET');


    request.flush(
      mockProducts
    );


    expect(
      component.products
    ).toEqual(
      mockProducts
    );

  });


  /**
   * ==========================================================
   * PRUEBA 3
   * ==========================================================
   *
   * Verifica que showCreateForm() prepare correctamente
   * el formulario para crear un producto.
   */
  it('should show create form', () => {

    component.editingProductId = '123';

    component.newProduct = {

      name: 'Anterior',

      brand: 'Anterior',

      price: 500

    };

    component.message = 'Mensaje anterior';


    component.showCreateForm();


    expect(
      component.showForm
    ).toBeTrue();


    expect(
      component.editingProductId
    ).toBeNull();


    expect(
      component.newProduct
    ).toEqual({

      name: '',

      brand: '',

      price: 0

    });


    expect(
      component.message
    ).toBe('');

  });


  /**
   * ==========================================================
   * PRUEBA 4
   * ==========================================================
   *
   * Verifica que el nombre sea obligatorio.
   */
  it('should validate required product name', () => {

    component.newProduct = {

      name: '',

      brand: 'TAP',

      price: 250

    };


    component.saveProduct();


    expect(
      component.messageType
    ).toBe('error');


    expect(
      component.message
    ).toBe(
      'El nombre del producto es obligatorio.'
    );

  });


  /**
   * ==========================================================
   * PRUEBA 5
   * ==========================================================
   *
   * Verifica que la marca sea obligatoria.
   */
  it('should validate required product brand', () => {

    component.newProduct = {

      name: 'Producto',

      brand: '',

      price: 250

    };


    component.saveProduct();


    expect(
      component.messageType
    ).toBe('error');


    expect(
      component.message
    ).toBe(
      'La marca del producto es obligatoria.'
    );

  });


  /**
   * ==========================================================
   * PRUEBA 6
   * ==========================================================
   *
   * Verifica que el precio solamente pueda estar
   * entre 0 y 999.99.
   */
  it('should validate product price', () => {

    component.newProduct = {

      name: 'Producto',

      brand: 'TAP',

      price: 1000

    };


    component.saveProduct();


    expect(
      component.messageType
    ).toBe('error');


    expect(
      component.message
    ).toBe(
      'El precio debe estar entre 0 y 999.99.'
    );

  });


  /**
   * ==========================================================
   * PRUEBA 7
   * ==========================================================
   *
   * Verifica la creación de un producto.
   */
  it('should create a product', () => {

    const createdProduct =
      createMockProduct();


    spyOn(
      productService,
      'createProduct'
    ).and.returnValue({

      subscribe: (observer: {
        next?: (product: Product) => void;
      }) => {

        observer.next?.(
          createdProduct
        );

        return {

          unsubscribe: () => {}

        };

      }

    } as ReturnType<
      ProductService['createProduct']
    >);


    component.newProduct = {

      name: 'Válvula de prueba',

      brand: 'TAP',

      price: 250

    };


    component.saveProduct();


    expect(
      productService.createProduct
    ).toHaveBeenCalledWith({

      name: 'Válvula de prueba',

      brand: 'TAP',

      price: 250

    });


    expect(
      component.products
    ).toContain(
      createdProduct
    );


    expect(
      component.message
    ).toBe(
      'Producto creado correctamente.'
    );

  });


  /**
   * ==========================================================
   * PRUEBA 8
   * ==========================================================
   *
   * Verifica que editProduct() copie correctamente
   * los datos del producto al formulario.
   */
  it('should edit a product', () => {

    const product =
      createMockProduct();


    component.editProduct(
      product
    );


    expect(
      component.editingProductId
    ).toBe(
      product.id!
    );


    expect(
      component.showForm
    ).toBeTrue();


    expect(
      component.newProduct.name
    ).toBe(
      product.name
    );


    expect(
      component.newProduct.brand
    ).toBe(
      product.brand
    );


    expect(
      component.newProduct.price
    ).toBe(
      product.price
    );

  });


  /**
   * ==========================================================
   * PRUEBA 9
   * ==========================================================
   *
   * Verifica la actualización de un producto.
   */
  it('should update a product', () => {

    const originalProduct =
      createMockProduct();


    const updatedProduct: Product = {

      ...originalProduct,

      name: 'Producto actualizado',

      brand: 'Nueva marca',

      price: 500

    };


    component.products = [

      originalProduct

    ];


    component.editingProductId =
      originalProduct.id!;


    component.newProduct = {

      name: 'Producto actualizado',

      brand: 'Nueva marca',

      price: 500

    };


    spyOn(
      productService,
      'updateProduct'
    ).and.returnValue({

      subscribe: (observer: {
        next?: (product: Product) => void;
      }) => {

        observer.next?.(
          updatedProduct
        );

        return {

          unsubscribe: () => {}

        };

      }

    } as ReturnType<
      ProductService['updateProduct']
    >);


    component.saveProduct();


    expect(
      productService.updateProduct
    ).toHaveBeenCalledWith(

      '123',

      {

        name: 'Producto actualizado',

        brand: 'Nueva marca',

        price: 500

      }

    );


    expect(
      component.products[0]
    ).toEqual(
      updatedProduct
    );


    expect(
      component.message
    ).toBe(
      'Producto actualizado correctamente.'
    );

  });


  /**
   * ==========================================================
   * PRUEBA 10
   * ==========================================================
   *
   * Verifica que viewProduct() seleccione el producto
   * y abra el modal.
   */
  it('should view a product', () => {

    const product =
      createMockProduct();


    component.viewProduct(
      product
    );


    expect(
      component.selectedProduct
    ).toEqual(
      product
    );


    expect(
      component.showDetailModal
    ).toBeTrue();

  });


  /**
   * ==========================================================
   * PRUEBA 11
   * ==========================================================
   *
   * Verifica la eliminación de un producto.
   */
  it('should delete a product', () => {

    const product =
      createMockProduct();


    component.products = [

      product

    ];


    spyOn(
      window,
      'confirm'
    ).and.returnValue(
      true
    );


    spyOn(
      productService,
      'deleteProduct'
    ).and.returnValue({

      subscribe: (observer: {
        next?: () => void;
      }) => {

        observer.next?.();

        return {

          unsubscribe: () => {}

        };

      }

    } as ReturnType<
      ProductService['deleteProduct']
    >);


    component.deleteProduct(
      product
    );


    expect(
      productService.deleteProduct
    ).toHaveBeenCalledWith(
      '123'
    );


    expect(
      component.products
    ).toEqual([]);

    
    expect(
      component.message
    ).toBe(
      'Producto eliminado correctamente.'
    );

  });


  /**
   * ==========================================================
   * PRUEBA 12
   * ==========================================================
   *
   * Verifica que cancelCreate() cierre y limpie
   * el formulario.
   */
  it('should cancel product creation', () => {

    component.showForm = true;

    component.editingProductId =
      '123';


    component.newProduct = {

      name: 'Producto',

      brand: 'TAP',

      price: 250

    };


    component.cancelCreate();


    expect(
      component.showForm
    ).toBeFalse();


    expect(
      component.editingProductId
    ).toBeNull();


    expect(
      component.newProduct
    ).toEqual({

      name: '',

      brand: '',

      price: 0

    });

  });


  /**
   * ==========================================================
   * PRUEBA 13
   * ==========================================================
   *
   * Verifica que resetForm() devuelva el formulario
   * a su estado inicial.
   */
  it('should reset the form', () => {

    component.showForm = true;

    component.editingProductId =
      '123';


    component.newProduct = {

      name: 'Producto',

      brand: 'TAP',

      price: 500

    };


    component.resetForm();


    expect(
      component.showForm
    ).toBeFalse();


    expect(
      component.editingProductId
    ).toBeNull();


    expect(
      component.newProduct
    ).toEqual({

      name: '',

      brand: '',

      price: 0

    });

  });


  /**
   * ==========================================================
   * PRUEBA 14
   * ==========================================================
   *
   * Verifica que showMessage() establezca correctamente
   * el tipo y contenido del mensaje.
   */
  it('should show messages', () => {

    component.showMessage(

      'success',

      'Operación correcta.'

    );


    expect(
      component.messageType
    ).toBe(
      'success'
    );


    expect(
      component.message
    ).toBe(
      'Operación correcta.'
    );


    component.clearMessage();


    expect(
      component.message
    ).toBe('');

  });


  /**
   * ==========================================================
   * PRUEBA 15
   * ==========================================================
   *
   * Verifica que exportToExcel() no intente exportar
   * cuando no existen productos.
   *
   * Esta prueba se concentra en la validación previa
   * del método.
   */
  it('should validate products before exporting to Excel', () => {

    component.products = [];


    component.exportToExcel();


    expect(
      component.messageType
    ).toBe(
      'info'
    );


    expect(
      component.message
    ).toBe(
      'No existen productos para exportar.'
    );

  });


  /**
   * ==========================================================
   * PRUEBA 16
   * ==========================================================
   *
   * Verifica que exportToPDF() no intente exportar
   * cuando no existen productos.
   *
   * Igual que en Excel, comprobamos primero la validación
   * de la lista.
   */
  it('should validate products before exporting to PDF', () => {

    component.products = [];


    component.exportToPDF();


    expect(
      component.messageType
    ).toBe(
      'info'
    );


    expect(
      component.message
    ).toBe(
      'No existen productos para exportar.'
    );

  });

});