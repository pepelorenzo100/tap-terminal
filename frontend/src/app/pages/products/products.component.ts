/**
 * ============================================================
 * TAP TERMINAL
 * MÓDULO DE ADMINISTRACIÓN DE PRODUCTOS
 * ============================================================
 *
 * Archivo:
 * products.component.ts
 *
 * Responsabilidades:
 *
 * 1. Cargar productos.
 * 2. Crear productos.
 * 3. Editar productos.
 * 4. Consultar productos.
 * 5. Eliminar productos.
 * 6. Exportar Excel.
 * 7. Exportar PDF.
 * 8. Mostrar mensajes.
 * 9. Cerrar sesión.
 *
 * ============================================================
 */

import {
  Component,
  OnInit
} from '@angular/core';


import {
  CommonModule
} from '@angular/common';


import {
  FormsModule
} from '@angular/forms';


import {
  Router
} from '@angular/router';


import {
  ProductService
} from '../../services/product.service';


import {
  AuthService
} from '../../services/auth.service';


import {
  Product,
  ProductRequest
} from '../../models/product';


import * as XLSX from 'xlsx';


import jsPDF from 'jspdf';


import autoTable from 'jspdf-autotable';


/**
 * ============================================================
 * COMPONENTE
 * ============================================================
 */

@Component({

  selector:
    'app-products',

  standalone:
    true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './products.component.html',

  styleUrl:
    './products.component.css'

})
export class ProductsComponent
  implements OnInit {


  /* ==========================================================
     PRODUCTOS
     ========================================================== */

  products: Product[] = [];


  /* ==========================================================
     FORMULARIO
     ========================================================== */

  showForm = false;


  editingProductId:
    string | number | null = null;


  newProduct:
    ProductRequest & {
      code?: string;
    } = {

      name: '',

      brand: '',

      price: 0

    };


  /* ==========================================================
     MODAL
     ========================================================== */

  selectedProduct:
    Product | null = null;


  showDetailModal = false;


  /* ==========================================================
     MENSAJES
     ========================================================== */

  message = '';


  messageType:
    'success' |
    'error' |
    'info' = 'info';


  /* ==========================================================
     CONSTRUCTOR
     ========================================================== */

  constructor(

    private readonly productService:
      ProductService,

    private readonly authService:
      AuthService,

    private readonly router:
      Router

  ) {}


  /* ==========================================================
     INICIALIZACIÓN
     ========================================================== */

  ngOnInit(): void {

    this.loadProducts();

  }


  /* ==========================================================
     CARGAR PRODUCTOS
     ========================================================== */

  loadProducts(): void {

    this.productService
      .getProducts()
      .subscribe({

        next:
          (products: Product[]) => {

            this.products =
              products;

          },

        error:
          (error: unknown) => {

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
     CREAR
     ========================================================== */

  showCreateForm(): void {

    this.editingProductId =
      null;


    this.newProduct = {

      name: '',

      brand: '',

      price: 0

    };


    this.showForm =
      true;


    this.clearMessage();

  }


  /* ==========================================================
     GUARDAR
     ========================================================== */

  saveProduct(): void {

    const name =
      String(
        this.newProduct.name ?? ''
      ).trim();


    if (!name) {

      this.showMessage(
        'error',
        'El nombre del producto es obligatorio.'
      );

      return;

    }


    const brand =
      String(
        this.newProduct.brand ?? ''
      ).trim();


    if (!brand) {

      this.showMessage(
        'error',
        'La marca del producto es obligatoria.'
      );

      return;

    }


    const price =
      Number(
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


    const request:
      ProductRequest = {

        name,

        brand,

        price

      };


    /* ========================================================
       CREAR
       ======================================================== */

    if (
      this.editingProductId === null
    ) {

      this.productService
        .createProduct(request)
        .subscribe({

          next:
            (product: Product) => {

              this.products = [

                ...this.products,

                product

              ];


              this.showMessage(
                'success',
                'Producto creado correctamente.'
              );


              this.resetForm();

            },


          error:
            (error: unknown) => {

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
       ACTUALIZAR
       ======================================================== */

    const productId =
      String(
        this.editingProductId
      );


    this.productService
      .updateProduct(
        productId,
        request
      )
      .subscribe({

        next:
          (updatedProduct: Product) => {

            this.products =
              this.products.map(

                (product: Product) => {

                  const currentId =
                    String(
                      product.id ?? ''
                    );


                  if (
                    currentId === productId
                  ) {

                    return updatedProduct;

                  }


                  return product;

                }

              );


            this.showMessage(
              'success',
              'Producto actualizado correctamente.'
            );


            this.resetForm();

          },


        error:
          (error: unknown) => {

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
     EDITAR
     ========================================================== */

  editProduct(
    product: Product
  ): void {

    this.closeDetailModal();


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


    this.editingProductId =
      product.id;


    this.newProduct = {

      name:
        product.name ?? '',

      brand:
        product.brand ?? '',

      price:
        Number(
          product.price ?? 0
        ),

      code:
        product.code

    };


    this.showForm =
      true;


    this.clearMessage();

  }


  /* ==========================================================
     VER
     ========================================================== */

  viewProduct(
    product: Product
  ): void {

    this.selectedProduct =
      product;


    this.showDetailModal =
      true;

  }


  /* ==========================================================
     CERRAR MODAL
     ========================================================== */

  closeDetailModal(): void {

    this.showDetailModal =
      false;


    this.selectedProduct =
      null;

  }


  /* ==========================================================
     CANCELAR
     ========================================================== */

  cancelCreate(): void {

    this.resetForm();

  }


  /* ==========================================================
     RESET
     ========================================================== */

  resetForm(): void {

    this.showForm =
      false;


    this.editingProductId =
      null;


    this.newProduct = {

      name: '',

      brand: '',

      price: 0

    };

  }


  /* ==========================================================
     ELIMINAR
     ========================================================== */

  deleteProduct(
    product: Product
  ): void {

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


    const confirmed =
      window.confirm(

        `¿Deseas eliminar el producto "${product.name}"?`

      );


    if (!confirmed) {

      return;

    }


    const productId =
      String(
        product.id
      );


    this.productService
      .deleteProduct(productId)
      .subscribe({

        next:
          () => {

            this.products =
              this.products.filter(

                (item: Product) => {

                  return String(
                    item.id
                  ) !== productId;

                }

              );


            if (

              this.selectedProduct &&

              String(
                this.selectedProduct.id
              ) === productId

            ) {

              this.closeDetailModal();

            }


            this.showMessage(
              'success',
              'Producto eliminado correctamente.'
            );

          },


        error:
          (error: unknown) => {

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
     MENSAJES
     ========================================================== */

  showMessage(

    type:
      'success' |
      'error' |
      'info',

    message:
      string

  ): void {

    this.messageType =
      type;


    this.message =
      message;

  }


  clearMessage(): void {

    this.message =
      '';

  }


  /* ==========================================================
     LOGOUT
     ========================================================== */

  logout(): void {

    this.authService
      .logout()
      .subscribe({

        next:
          () => {

            this.authService
              .clearToken();


            this.router
              .navigate([
                '/login'
              ]);

          },


        error:
          (error: unknown) => {

            console.error(
              'Error al cerrar sesión:',
              error
            );


            /**
             * Aunque el backend falle, eliminamos
             * el token local para evitar dejar al
             * usuario aparentemente autenticado.
             */
            this.authService
              .clearToken();


            this.router
              .navigate([
                '/login'
              ]);

          }

      });

  }


  /* ==========================================================
     EXCEL
     ========================================================== */

  exportToExcel(): void {

    if (
      this.products.length === 0
    ) {

      this.showMessage(
        'info',
        'No existen productos para exportar.'
      );

      return;

    }


    const data =
      this.products.map(

        (product: Product) => ({

          Código:
            product.code ?? '',

          Nombre:
            product.name ?? '',

          Marca:
            product.brand ?? '',

          Precio:
            Number(
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


    const worksheet =
      XLSX.utils.json_to_sheet(
        data
      );


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(

      workbook,

      worksheet,

      'Productos'

    );


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
     PDF
     ========================================================== */

  exportToPDF(): void {

    if (
      this.products.length === 0
    ) {

      this.showMessage(
        'info',
        'No existen productos para exportar.'
      );

      return;

    }


    const doc =
      new jsPDF();


    doc.setFontSize(
      18
    );


    doc.text(
      'TAP Terminal',
      14,
      18
    );


    doc.setFontSize(
      11
    );


    doc.text(
      'Listado de productos',
      14,
      26
    );


    doc.setFontSize(
      9
    );


    doc.text(

      `Generado: ${new Date().toLocaleString('es-MX')}`,

      14,

      33

    );


    const head:
      string[][] = [

        [

          'Código',

          'Nombre',

          'Marca',

          'Precio',

          'Fecha de creación'

        ]

      ];


    const body:
      string[][] =

      this.products.map(

        (
          product: Product
        ): string[] => [

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


    autoTable(

      doc,

      {

        head,

        body,

        startY:
          40,

        theme:
          'grid',

        styles: {

          fontSize:
            8,

          cellPadding:
            3

        },

        headStyles: {

          fontSize:
            8

        }

      }

    );


    doc.save(
      'productos-tap-terminal.pdf'
    );


    this.showMessage(
      'success',
      'Archivo PDF generado correctamente.'
    );

  }

}