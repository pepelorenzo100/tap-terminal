/**
 * ============================================================
 * TAP TERMINAL
 * MÓDULO DE ADMINISTRACIÓN DE PRODUCTOS
 * ============================================================
 *
 * Archivo:
 * products.component.ts
 *
 * Tipo:
 * FRONTEND - Angular / TypeScript
 *
 * Responsabilidades:
 *
 * 1. Consultar productos.
 * 2. Crear productos.
 * 3. Editar productos.
 * 4. Visualizar productos.
 * 5. Eliminar productos.
 * 6. Validar información.
 * 7. Mostrar mensajes al usuario.
 * 8. Exportar productos a Excel.
 * 9. Exportar productos a PDF.
 *
 * Arquitectura:
 *
 * Angular
 *    ↓
 * ProductsComponent
 *    ↓
 * ProductService
 *    ↓
 * HTTP
 *    ↓
 * Laravel API
 *    ↓
 * ProductController
 *    ↓
 * Product Model
 *    ↓
 * MongoDB
 *
 * ============================================================
 */


/* ============================================================
   IMPORTACIONES DE ANGULAR
   ============================================================ */

/**
 * CommonModule proporciona funcionalidades comunes
 * utilizadas por las plantillas Angular.
 *
 * En este componente se utiliza principalmente para:
 *
 * - *ngIf
 * - *ngFor
 * - pipes como number y date
 */
import { CommonModule } from '@angular/common';


/**
 * Component:
 *
 * Permite declarar el componente Angular.
 *
 * OnInit:
 *
 * Permite ejecutar lógica cuando el componente
 * termina de inicializarse.
 */
import {
  Component,
  OnInit
} from '@angular/core';


/**
 * FormsModule permite utilizar formularios basados
 * en plantillas y [(ngModel)].
 */
import {
  FormsModule
} from '@angular/forms';


/* ============================================================
   MODELO Y SERVICIO
   ============================================================ */

/**
 * Modelo que representa un producto.
 */
import {
  Product
} from '../../models/product';


/**
 * Servicio encargado de comunicarse con Laravel.
 */
import {
  ProductService
} from '../../services/product.service';


/* ============================================================
   LIBRERÍAS DE EXPORTACIÓN
   ============================================================ */

/**
 * SheetJS / XLSX:
 *
 * Permite generar archivos Excel desde Angular.
 */
import * as XLSX from 'xlsx';


/**
 * jsPDF:
 *
 * Permite crear documentos PDF.
 */
import jsPDF from 'jspdf';


/**
 * jspdf-autotable:
 *
 * Permite generar tablas dentro del PDF.
 */
import autoTable from 'jspdf-autotable';


/**
 * ============================================================
 * INTERFAZ PARA CREAR / ACTUALIZAR PRODUCTOS
 * ============================================================
 *
 * Estos son los únicos campos que el frontend necesita
 * enviar al backend para crear o modificar un producto.
 *
 * El backend se encarga de generar:
 *
 * - id
 * - code
 * - created_at
 * - updated_at
 *
 * El código NO debe ser enviado desde el formulario.
 *
 * ============================================================
 */
interface ProductRequest {

  /**
   * Nombre del producto.
   */
  name: string;

  /**
   * Marca del producto.
   */
  brand: string;

  /**
   * Precio del producto.
   */
  price: number;

}


/**
 * ============================================================
 * COMPONENTE DE PRODUCTOS
 * ============================================================
 */
@Component({

  /**
   * Selector utilizado en la aplicación.
   */
  selector: 'app-products',

  /**
   * El componente funciona como componente standalone.
   */
  standalone: true,

  /**
   * Módulos necesarios para la plantilla.
   */
  imports: [

    CommonModule,

    FormsModule

  ],

  /**
   * Plantilla HTML del componente.
   */
  templateUrl: './products.component.html',

  /**
   * Estilos CSS del componente.
   */
  styleUrls: ['./products.component.css']

})


export class ProductsComponent implements OnInit {


  /* ==========================================================
     LISTA DE PRODUCTOS
     ========================================================== */

  /**
   * Productos obtenidos desde Laravel.
   *
   * Inicialmente el arreglo está vacío.
   */
  products: Product[] = [];


  /* ==========================================================
     PRODUCTO SELECCIONADO
     ========================================================== */

  /**
   * Producto actualmente seleccionado para visualizar
   * sus detalles en el modal.
   *
   * null significa que no existe ningún producto seleccionado.
   */
  selectedProduct: Product | null = null;


  /* ==========================================================
     PRODUCTO DEL FORMULARIO
     ========================================================== */

  /**
   * Contiene la información introducida en el formulario.
   *
   * También puede contener propiedades parciales de Product
   * cuando estamos editando.
   */
  newProduct: ProductRequest & Partial<Product> = {

    name: '',

    brand: '',

    price: 0

  };


  /* ==========================================================
     ESTADO DEL FORMULARIO
     ========================================================== */

  /**
   * true:
   *
   * El formulario está visible.
   *
   * false:
   *
   * El formulario está oculto.
   */
  showForm = false;


  /* ==========================================================
     PRODUCTO EN EDICIÓN
     ========================================================== */

  /**
   * Identificador del producto que se está editando.
   *
   * null:
   *
   * Estamos creando un producto nuevo.
   *
   * string | number:
   *
   * Estamos editando un producto existente.
   */
  editingProductId: string | number | null = null;


  /* ==========================================================
     MODAL DE DETALLE
     ========================================================== */

  /**
   * Controla la visibilidad del modal.
   */
  showDetailModal = false;


  /* ==========================================================
     MENSAJES DEL SISTEMA
     ========================================================== */

  /**
   * Texto del mensaje mostrado al usuario.
   */
  message = '';


  /**
   * Tipo visual del mensaje.
   *
   * success:
   * operación correcta.
   *
   * error:
   * ocurrió un error.
   *
   * info:
   * información general.
   */
  messageType: 'success' | 'error' | 'info' = 'info';


  /* ==========================================================
     CONSTRUCTOR
     ========================================================== */

  /**
   * Angular inyecta ProductService automáticamente.
   */
  constructor(

    private readonly productService: ProductService

  ) {}


  /* ==========================================================
     INICIALIZACIÓN
     ========================================================== */

  /**
   * Angular ejecuta este método cuando el componente
   * termina de inicializarse.
   */
  ngOnInit(): void {

    /**
     * Cargar los productos almacenados en MongoDB.
     */
    this.loadProducts();

  }


  /* ==========================================================
     CARGAR PRODUCTOS
     ========================================================== */

  /**
   * Solicita todos los productos al backend.
   *
   * Flujo:
   *
   * ProductsComponent
   *      ↓
   * ProductService
   *      ↓
   * GET /api/products
   *      ↓
   * Laravel
   *      ↓
   * MongoDB
   */
  loadProducts(): void {

    this.productService.getProducts().subscribe({

      /**
       * Respuesta exitosa.
       */
      next: (products: Product[]) => {

        this.products = products;

      },

      /**
       * Error.
       */
      error: (error: unknown) => {

        console.error(
          'Error al cargar productos:',
          error
        );

        this.showMessage(
          'error',
          'No fue posible cargar los productos.'
        );

      }

    });

  }


  /* ==========================================================
     MOSTRAR FORMULARIO DE CREACIÓN
     ========================================================== */

  /**
   * Prepara el formulario para registrar
   * un producto nuevo.
   */
  showCreateForm(): void {

    /**
     * Al crear no existe producto en edición.
     */
    this.editingProductId = null;


    /**
     * Limpiar los datos del formulario.
     */
    this.newProduct = {

      name: '',

      brand: '',

      price: 0

    };


    /**
     * Mostrar formulario.
     */
    this.showForm = true;


    /**
     * Limpiar mensajes anteriores.
     */
    this.clearMessage();

  }


  /* ==========================================================
     GUARDAR PRODUCTO
     ========================================================== */

  /**
   * Guarda un producto nuevo o actualiza uno existente.
   *
   * La operación depende de:
   *
   * editingProductId
   *
   * null:
   * CREATE
   *
   * con valor:
   * UPDATE
   */
  saveProduct(): void {


    /* ========================================================
       VALIDAR NOMBRE
       ======================================================== */

    const name = String(
      this.newProduct.name ?? ''
    ).trim();


    if (!name) {

      this.showMessage(
        'error',
        'El nombre del producto es obligatorio.'
      );

      return;

    }


    /* ========================================================
       VALIDAR MARCA
       ======================================================== */

    const brand = String(
      this.newProduct.brand ?? ''
    ).trim();


    if (!brand) {

      this.showMessage(
        'error',
        'La marca del producto es obligatoria.'
      );

      return;

    }


    /* ========================================================
       VALIDAR PRECIO
       ======================================================== */

    const price = Number(
      this.newProduct.price
    );


    if (
      !Number.isFinite(price) ||
      price < 0 ||
      price > 999.99
    ) {

      this.showMessage(
        'error',
        'El precio debe estar entre 0 y 999.99.'
      );

      return;

    }


    /* ========================================================
       PREPARAR DATOS
       ======================================================== */

    const request: ProductRequest = {

      name,

      brand,

      price

    };


    /* ========================================================
       CREAR PRODUCTO
       ======================================================== */

    if (this.editingProductId === null) {

      this.productService
        .createProduct(request)
        .subscribe({

          /**
           * Producto creado correctamente.
           */
          next: (product: Product) => {

            /**
             * Agregar el producto recibido
             * a la lista actual.
             */
            this.products = [

              ...this.products,

              product

            ];


            this.showMessage(
              'success',
              'Producto creado correctamente.'
            );


            /**
             * Limpiar y ocultar formulario.
             */
            this.resetForm();

          },


          /**
           * Error durante la creación.
           */
          error: (error: unknown) => {

            console.error(
              'Error al crear producto:',
              error
            );

            this.showMessage(
              'error',
              'No fue posible crear el producto.'
            );

          }

        });


      return;

    }


    /* ========================================================
       ACTUALIZAR PRODUCTO
       ======================================================== */

    /**
     * Convertimos el ID a string para utilizarlo
     * correctamente en la URL de la API.
     */
    const productId = String(
      this.editingProductId
    );


    this.productService
      .updateProduct(
        productId,
        request
      )
      .subscribe({

        /**
         * Producto actualizado correctamente.
         */
        next: (updatedProduct: Product) => {

          /**
           * Reemplazar únicamente el producto actualizado
           * dentro del arreglo.
           */
          this.products = this.products.map(

            (product: Product) => {

              const currentId = String(
                product.id ?? ''
              );


              if (currentId === productId) {

                return updatedProduct;

              }


              return product;

            }

          );


          this.showMessage(
            'success',
            'Producto actualizado correctamente.'
          );


          /**
           * Limpiar formulario.
           */
          this.resetForm();

        },


        /**
         * Error durante la actualización.
         */
        error: (error: unknown) => {

          console.error(
            'Error al actualizar producto:',
            error
          );

          this.showMessage(
            'error',
            'No fue posible actualizar el producto.'
          );

        }

      });

  }


  /* ==========================================================
     EDITAR PRODUCTO
     ========================================================== */

  /**
   * Carga los datos del producto seleccionado
   * dentro del formulario de edición.
   */
  editProduct(product: Product): void {

    /**
     * Cerrar el modal si estaba abierto.
     */
    this.closeDetailModal();


    /**
     * Validar que el producto tenga ID.
     */
    if (
      product.id === undefined ||
      product.id === null
    ) {

      this.showMessage(
        'error',
        'El producto no tiene un identificador válido.'
      );

      return;

    }


    /**
     * Guardar el ID del producto.
     */
    this.editingProductId = product.id;


    /**
     * Copiar la información del producto
     * al formulario.
     */
    this.newProduct = {

      ...product,

      name: product.name ?? '',

      brand: product.brand ?? '',

      price: Number(product.price ?? 0)

    };


    /**
     * Mostrar formulario.
     */
    this.showForm = true;


    /**
     * Limpiar mensajes anteriores.
     */
    this.clearMessage();

  }


  /* ==========================================================
     VER PRODUCTO
     ========================================================== */

  /**
   * Abre el modal de detalle.
   */
  viewProduct(product: Product): void {

    this.selectedProduct = product;

    this.showDetailModal = true;

  }


  /* ==========================================================
     CERRAR MODAL
     ========================================================== */

  /**
   * Cierra el modal y elimina la selección actual.
   */
  closeDetailModal(): void {

    this.showDetailModal = false;

    this.selectedProduct = null;

  }


  /* ==========================================================
     CANCELAR FORMULARIO
     ========================================================== */

  /**
   * Cancela la creación o edición.
   */
  cancelCreate(): void {

    this.resetForm();

  }


  /* ==========================================================
     REINICIAR FORMULARIO
     ========================================================== */

  /**
   * Devuelve el formulario a su estado inicial.
   */
  resetForm(): void {

    this.showForm = false;

    this.editingProductId = null;

    this.newProduct = {

      name: '',

      brand: '',

      price: 0

    };

  }


  /* ==========================================================
     ELIMINAR PRODUCTO
     ========================================================== */

  /**
   * Elimina un producto después de solicitar
   * confirmación al usuario.
   */
  deleteProduct(product: Product): void {


    /* ========================================================
       VALIDAR ID
       ======================================================== */

    if (
      product.id === undefined ||
      product.id === null
    ) {

      this.showMessage(
        'error',
        'El producto no tiene un identificador válido.'
      );

      return;

    }


    /* ========================================================
       CONFIRMACIÓN
       ======================================================== */

    const confirmed = window.confirm(

      `¿Deseas eliminar el producto "${product.name}"?`

    );


    if (!confirmed) {

      return;

    }


    /* ========================================================
       CONVERTIR ID
       ======================================================== */

    const productId = String(
      product.id
    );


    /* ========================================================
       SOLICITAR ELIMINACIÓN AL BACKEND
       ======================================================== */

    this.productService
      .deleteProduct(productId)
      .subscribe({

        /**
         * Eliminación exitosa.
         */
        next: () => {

          /**
           * Eliminar el producto de la lista local.
           */
          this.products = this.products.filter(

            (item: Product) => {

              return String(item.id) !== productId;

            }

          );


          /**
           * Si el producto eliminado estaba
           * abierto en el modal, cerrarlo.
           */
          if (

            this.selectedProduct &&

            String(this.selectedProduct.id) === productId

          ) {

            this.closeDetailModal();

          }


          /**
           * Mostrar confirmación.
           */
          this.showMessage(
            'success',
            'Producto eliminado correctamente.'
          );

        },


        /**
         * Error durante la eliminación.
         */
        error: (error: unknown) => {

          console.error(
            'Error al eliminar producto:',
            error
          );

          this.showMessage(
            'error',
            'No fue posible eliminar el producto.'
          );

        }

      });

  }


  /* ==========================================================
     MOSTRAR MENSAJE
     ========================================================== */

  /**
   * Actualiza el mensaje mostrado al usuario.
   */
  showMessage(

    type: 'success' | 'error' | 'info',

    message: string

  ): void {

    this.messageType = type;

    this.message = message;

  }


  /* ==========================================================
     LIMPIAR MENSAJE
     ========================================================== */

  /**
   * Elimina el mensaje actual.
   */
  clearMessage(): void {

    this.message = '';

  }


  /* ==========================================================
     EXPORTAR A EXCEL
     ========================================================== */

  /**
   * Genera un archivo Excel directamente desde Angular.
   *
   * No necesita comunicarse con Laravel.
   */
  exportToExcel(): void {


    /* ========================================================
       VALIDAR LISTA
       ======================================================== */

    if (this.products.length === 0) {

      this.showMessage(
        'info',
        'No existen productos para exportar.'
      );

      return;

    }


    /* ========================================================
       PREPARAR DATOS
       ======================================================== */

    const data = this.products.map(

      (product: Product) => ({

        Código: product.code ?? '',

        Nombre: product.name ?? '',

        Marca: product.brand ?? '',

        Precio: Number(
          product.price ?? 0
        ),

        'Fecha de creación':
          product.created_at
            ? new Date(
                product.created_at
              ).toLocaleString('es-MX')
            : ''

      })

    );


    /* ========================================================
       CREAR HOJA
       ======================================================== */

    const worksheet = XLSX.utils.json_to_sheet(
      data
    );


    /* ========================================================
       CREAR LIBRO
       ======================================================== */

    const workbook = XLSX.utils.book_new();


    /* ========================================================
       AGREGAR HOJA
       ======================================================== */

    XLSX.utils.book_append_sheet(

      workbook,

      worksheet,

      'Productos'

    );


    /* ========================================================
       GENERAR ARCHIVO
       ======================================================== */

    XLSX.writeFile(

      workbook,

      'productos-tap-terminal.xlsx'

    );


    this.showMessage(
      'success',
      'Archivo Excel generado correctamente.'
    );

  }


  /* ==========================================================
     EXPORTAR A PDF
     ========================================================== */

  /**
   * Genera un documento PDF con la lista de productos.
   */
  exportToPDF(): void {


    /* ========================================================
       VALIDAR LISTA
       ======================================================== */

    if (this.products.length === 0) {

      this.showMessage(
        'info',
        'No existen productos para exportar.'
      );

      return;

    }


    /* ========================================================
       CREAR DOCUMENTO
       ======================================================== */

    const doc = new jsPDF();


    /* ========================================================
       TÍTULO
       ======================================================== */

    doc.setFontSize(18);

    doc.text(
      'TAP Terminal',
      14,
      18
    );


    /* ========================================================
       SUBTÍTULO
       ======================================================== */

    doc.setFontSize(11);

    doc.text(
      'Listado de productos',
      14,
      26
    );


    /* ========================================================
       FECHA DE GENERACIÓN
       ======================================================== */

    doc.setFontSize(9);

    doc.text(

      `Generado: ${new Date().toLocaleString('es-MX')}`,

      14,

      33

    );


    /* ========================================================
       ENCABEZADOS DE TABLA
       ======================================================== */

    const head: string[][] = [

      [

        'Código',

        'Nombre',

        'Marca',

        'Precio',

        'Fecha de creación'

      ]

    ];


    /* ========================================================
       CUERPO DE TABLA
       ======================================================== */

    /**
     * Todos los valores se convierten explícitamente
     * a string para garantizar compatibilidad con
     * jspdf-autotable.
     */
    const body: string[][] = this.products.map(

      (product: Product): string[] => [

        String(
          product.code ?? ''
        ),

        String(
          product.name ?? ''
        ),

        String(
          product.brand ?? ''
        ),

        `MX$${Number(
          product.price ?? 0
        ).toFixed(2)}`,

        product.created_at

          ? new Date(
              product.created_at
            ).toLocaleString('es-MX')

          : '—'

      ]

    );


    /* ========================================================
       GENERAR TABLA
       ======================================================== */

    autoTable(

      doc,

      {

        head,

        body,

        startY: 40,

        theme: 'grid',

        styles: {

          fontSize: 8,

          cellPadding: 3

        },

        headStyles: {

          fontSize: 8

        }

      }

    );


    /* ========================================================
       GUARDAR PDF
       ======================================================== */

    doc.save(
      'productos-tap-terminal.pdf'
    );


    this.showMessage(
      'success',
      'Archivo PDF generado correctamente.'
    );

  }

}