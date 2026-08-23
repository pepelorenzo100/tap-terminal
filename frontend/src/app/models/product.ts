/**
 * ============================================================
 * TAP TERMINAL
 * MODELOS DE PRODUCTOS
 * ============================================================
 *
 * Archivo:
 * product.ts
 *
 * Responsabilidad:
 *
 * Definir las estructuras de datos utilizadas
 * por el módulo de productos.
 *
 * ============================================================
 */


/**
 * ============================================================
 * PRODUCT
 * ============================================================
 *
 * Representa un producto recibido desde Laravel.
 */

export interface Product {

  /**
   * Identificador interno del producto.
   */
  id?: string | number;


  /**
   * Código generado automáticamente por Laravel.
   */
  code?: string;


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


  /**
   * Fecha de creación.
   */
  created_at?: string | null;


  /**
   * Fecha de actualización.
   */
  updated_at?: string | null;

}


/**
 * ============================================================
 * PRODUCT REQUEST
 * ============================================================
 *
 * Representa únicamente los datos que Angular
 * envía a Laravel para crear o actualizar.
 *
 * IMPORTANTE:
 *
 * El código NO se envía.
 *
 * Laravel es responsable de generarlo.
 */

export interface ProductRequest {

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