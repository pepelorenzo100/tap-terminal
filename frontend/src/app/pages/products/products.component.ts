/*
|--------------------------------------------------------------------------
| TAP TERMINAL - PRODUCTS COMPONENT
|--------------------------------------------------------------------------
|
| Archivo:
|   frontend/src/app/pages/products/products.component.ts
|
| Responsabilidad:
|
|   Administrar la pantalla de consulta de productos.
|
| Funcionalidades:
|
|   - Consultar productos.
|   - Crear productos.
|   - Editar productos.
|   - Visualizar el detalle de un producto.
|   - Eliminar productos.
|   - Exportar productos a Excel.
|   - Exportar productos a PDF.
|   - Mostrar mensajes de operación.
|
| Seguridad:
|
|   El cierre de sesión NO pertenece a este componente.
|   La sesión se administra de forma centralizada mediante
|   NavbarComponent y AuthService.
|
| Arquitectura:
|
|   ProductsComponent
|        ↓
|   ProductService
|        ↓
|   HTTP
|        ↓
|   Laravel API
|        ↓
|   MongoDB
|
|--------------------------------------------------------------------------
*/

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../services/product.service';

import {
  Product,
  ProductRequest
} from '../../models/product';

import * as XLSX from 'xlsx';

import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';


/*
|--------------------------------------------------------------------------
| COMPONENTE DE PRODUCTOS
|--------------------------------------------------------------------------
|
| Componente standalone utilizado para administrar el catálogo
| de productos del sistema TAP Terminal.
|
|--------------------------------------------------------------------------
*/

@Component({
  selector: 'app-products',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './products.component.html',

  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  /*
  |--------------------------------------------------------------------------
  | LISTADO DE PRODUCTOS
  |--------------------------------------------------------------------------
  |
  | Contiene los productos obtenidos desde la API.
  |
  */

  products: Product[] = [];


  /*
  |--------------------------------------------------------------------------
  | ESTADO DEL FORMULARIO
  |--------------------------------------------------------------------------
  |
  | showForm:
  |   Indica si el formulario de alta/edición está visible.
  |
  | editingProductId:
  |   Identificador del producto que se está editando.
  |
  |   null = alta de producto.
  |
  */

  showForm = false;

  editingProductId: string | number | null = null;


  /*
  |--------------------------------------------------------------------------
  | MODELO DEL FORMULARIO
  |--------------------------------------------------------------------------
  |
  | El código no se captura desde el formulario.
  |
  | El backend es responsable de generar automáticamente
  | el código del producto.
  |
  */

  newProduct: ProductRequest & {
    code?: string;
  } = {
    name: '',
    brand: '',
    price: 0
  };


  /*
  |--------------------------------------------------------------------------
  | MODAL DE DETALLE
  |--------------------------------------------------------------------------
  |
  | selectedProduct:
  |   Producto actualmente seleccionado.
  |
  | showDetailModal:
  |   Controla la visibilidad del modal.
  |
  */

  selectedProduct: Product | null = null;

  showDetailModal = false;


  /*
  |--------------------------------------------------------------------------
  | MENSAJES DE LA INTERFAZ
  |--------------------------------------------------------------------------
  |
  | Permiten informar al usuario el resultado de las operaciones.
  |
  */

  message = '';

  messageType: 'success' | 'error' | 'info' = 'info';


  /*
  |--------------------------------------------------------------------------
  | CONSTRUCTOR
  |--------------------------------------------------------------------------
  |
  | ProductService:
  |   Encargado de comunicarse con la API de productos.
  |
  | IMPORTANTE:
  |
  | AuthService y Router no se utilizan aquí.
  |
  | El cierre de sesión está centralizado en NavbarComponent,
  | evitando duplicar responsabilidades y botones.
  |
  */

  constructor(
    private readonly productService: ProductService
  ) {}


  /*
  |--------------------------------------------------------------------------
  | INICIALIZACIÓN
  |--------------------------------------------------------------------------
  |
  | Al cargar la pantalla se consulta el listado de productos.
  |
  */

  ngOnInit(): void {
    this.loadProducts();
  }


  /*
  |--------------------------------------------------------------------------
  | CARGAR PRODUCTOS
  |--------------------------------------------------------------------------
  |
  | GET /api/products
  |
  | Solicita al backend el listado actualizado de productos.
  |
  */

  loadProducts(): void {
    this.productService
      .getProducts()
      .subscribe({
        next: (products: Product[]) => {
          this.products = products;
        },

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


  /*
  |--------------------------------------------------------------------------
  | MOSTRAR FORMULARIO DE ALTA
  |--------------------------------------------------------------------------
  |
  | Prepara el formulario para registrar un nuevo producto.
  |
  */

  showCreateForm(): void {
    this.editingProductId = null;

    this.newProduct = {
      name: '',
      brand: '',
      price: 0
    };

    this.showForm = true;

    this.clearMessage();
  }


  /*
  |--------------------------------------------------------------------------
  | GUARDAR PRODUCTO
  |--------------------------------------------------------------------------
  |
  | Determina si la operación corresponde a:
  |
  |   - Alta.
  |   - Edición.
  |
  | Validaciones:
  |
  |   - Nombre obligatorio.
  |   - Marca obligatoria.
  |   - Precio numérico.
  |   - Precio entre 0 y 999.99.
  |
  | El código y la fecha de creación son responsabilidad
  | del backend.
  |
  */

  saveProduct(): void {

    /*
    |--------------------------------------------------------------------------
    | VALIDAR NOMBRE
    |--------------------------------------------------------------------------
    */

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


    /*
    |--------------------------------------------------------------------------
    | VALIDAR MARCA
    |--------------------------------------------------------------------------
    */

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


    /*
    |--------------------------------------------------------------------------
    | VALIDAR PRECIO
    |--------------------------------------------------------------------------
    |
    | El examen establece un máximo de tres dígitos para el precio.
    |
    | Se permite trabajar con decimales hasta 999.99.
    |
    */

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


    /*
    |--------------------------------------------------------------------------
    | PREPARAR REQUEST
    |--------------------------------------------------------------------------
    */

    const request: ProductRequest = {
      name,
      brand,
      price
    };


    /*
    |--------------------------------------------------------------------------
    | CREAR PRODUCTO
    |--------------------------------------------------------------------------
    |
    | Cuando editingProductId es null se realiza una operación
    | de creación.
    |
    */

    if (this.editingProductId === null) {

      this.productService
        .createProduct(request)
        .subscribe({
          next: (product: Product) => {

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


    /*
    |--------------------------------------------------------------------------
    | ACTUALIZAR PRODUCTO
    |--------------------------------------------------------------------------
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
        next: (updatedProduct: Product) => {

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

          this.resetForm();
        },

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


  /*
  |--------------------------------------------------------------------------
  | EDITAR PRODUCTO
  |--------------------------------------------------------------------------
  |
  | Carga la información del producto seleccionado dentro
  | del formulario.
  |
  | El código solamente se muestra como referencia.
  | No se permite modificarlo desde el frontend.
  |
  */

  editProduct(product: Product): void {

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

    this.editingProductId = product.id;

    this.newProduct = {
      name: product.name ?? '',

      brand: product.brand ?? '',

      price: Number(
        product.price ?? 0
      ),

      code: product.code
    };

    this.showForm = true;

    this.clearMessage();
  }


  /*
  |--------------------------------------------------------------------------
  | VISUALIZAR PRODUCTO
  |--------------------------------------------------------------------------
  |
  | Abre el modal con la información del producto seleccionado.
  |
  */

  viewProduct(product: Product): void {
    this.selectedProduct = product;

    this.showDetailModal = true;
  }


  /*
  |--------------------------------------------------------------------------
  | CERRAR MODAL DE DETALLE
  |--------------------------------------------------------------------------
  */

  closeDetailModal(): void {
    this.showDetailModal = false;

    this.selectedProduct = null;
  }


  /*
  |--------------------------------------------------------------------------
  | CANCELAR FORMULARIO
  |--------------------------------------------------------------------------
  */

  cancelCreate(): void {
    this.resetForm();
  }


  /*
  |--------------------------------------------------------------------------
  | RESTABLECER FORMULARIO
  |--------------------------------------------------------------------------
  |
  | Limpia el estado del formulario y regresa la pantalla
  | al modo de consulta.
  |
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


  /*
  |--------------------------------------------------------------------------
  | ELIMINAR PRODUCTO
  |--------------------------------------------------------------------------
  |
  | DELETE /api/products/{id}
  |
  | Antes de eliminar se solicita confirmación al usuario.
  |
  */

  deleteProduct(product: Product): void {

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


    /*
    |--------------------------------------------------------------------------
    | CONFIRMACIÓN
    |--------------------------------------------------------------------------
    */

    const confirmed = window.confirm(
      `¿Deseas eliminar el producto "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }


    /*
    |--------------------------------------------------------------------------
    | IDENTIFICADOR
    |--------------------------------------------------------------------------
    */

    const productId = String(
      product.id
    );


    /*
    |--------------------------------------------------------------------------
    | ELIMINACIÓN
    |--------------------------------------------------------------------------
    */

    this.productService
      .deleteProduct(productId)
      .subscribe({
        next: () => {

          this.products = this.products.filter(
            (item: Product) => {

              return String(
                item.id
              ) !== productId;

            }
          );


          /*
          |--------------------------------------------------------------------------
          | CERRAR MODAL SI EL PRODUCTO ELIMINADO ESTABA SELECCIONADO
          |--------------------------------------------------------------------------
          */

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


  /*
  |--------------------------------------------------------------------------
  | MOSTRAR MENSAJE
  |--------------------------------------------------------------------------
  */

  showMessage(
    type: 'success' | 'error' | 'info',
    message: string
  ): void {
    this.messageType = type;

    this.message = message;
  }


  /*
  |--------------------------------------------------------------------------
  | LIMPIAR MENSAJE
  |--------------------------------------------------------------------------
  */

  clearMessage(): void {
    this.message = '';
  }


  /*
  |--------------------------------------------------------------------------
  | EXPORTAR A EXCEL
  |--------------------------------------------------------------------------
  |
  | Genera un archivo XLSX con el listado actual de productos.
  |
  | La exportación se realiza en el navegador utilizando
  | la librería SheetJS.
  |
  */

  exportToExcel(): void {

    if (this.products.length === 0) {
      this.showMessage(
        'info',
        'No existen productos para exportar.'
      );

      return;
    }


    /*
    |--------------------------------------------------------------------------
    | PREPARAR DATOS
    |--------------------------------------------------------------------------
    */

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


    /*
    |--------------------------------------------------------------------------
    | CREAR HOJA DE CÁLCULO
    |--------------------------------------------------------------------------
    */

    const worksheet =
      XLSX.utils.json_to_sheet(data);


    /*
    |--------------------------------------------------------------------------
    | CREAR LIBRO
    |--------------------------------------------------------------------------
    */

    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Productos'
    );


    /*
    |--------------------------------------------------------------------------
    | DESCARGAR ARCHIVO
    |--------------------------------------------------------------------------
    */

    XLSX.writeFile(
      workbook,
      'productos-tap-terminal.xlsx'
    );


    this.showMessage(
      'success',
      'Archivo Excel generado correctamente.'
    );
  }


  /*
  |--------------------------------------------------------------------------
  | EXPORTAR A PDF
  |--------------------------------------------------------------------------
  |
  | Genera un documento PDF con:
  |
  |   - Código.
  |   - Nombre.
  |   - Marca.
  |   - Precio.
  |   - Fecha de creación.
  |
  */

  exportToPDF(): void {

    if (this.products.length === 0) {
      this.showMessage(
        'info',
        'No existen productos para exportar.'
      );

      return;
    }


    /*
    |--------------------------------------------------------------------------
    | CREAR DOCUMENTO
    |--------------------------------------------------------------------------
    */

    const doc = new jsPDF();


    /*
    |--------------------------------------------------------------------------
    | ENCABEZADO
    |--------------------------------------------------------------------------
    */

    doc.setFontSize(18);

    doc.text(
      'TAP Terminal',
      14,
      18
    );

    doc.setFontSize(11);

    doc.text(
      'Listado de productos',
      14,
      26
    );

    doc.setFontSize(9);

    doc.text(
      `Generado: ${new Date().toLocaleString('es-MX')}`,
      14,
      33
    );


    /*
    |--------------------------------------------------------------------------
    | ENCABEZADOS DE LA TABLA
    |--------------------------------------------------------------------------
    */

    const head: string[][] = [
      [
        'Código',
        'Nombre',
        'Marca',
        'Precio',
        'Fecha de creación'
      ]
    ];


    /*
    |--------------------------------------------------------------------------
    | INFORMACIÓN DE LA TABLA
    |--------------------------------------------------------------------------
    */

    const body: string[][] =
      this.products.map(
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


    /*
    |--------------------------------------------------------------------------
    | GENERAR TABLA
    |--------------------------------------------------------------------------
    */

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


    /*
    |--------------------------------------------------------------------------
    | DESCARGAR PDF
    |--------------------------------------------------------------------------
    */

    doc.save(
      'productos-tap-terminal.pdf'
    );


    this.showMessage(
      'success',
      'Archivo PDF generado correctamente.'
    );
  }
}