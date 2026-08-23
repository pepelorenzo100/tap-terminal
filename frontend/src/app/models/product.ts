/**
 * ============================================================
 * TAP TERMINAL
 * MODELO DE PRODUCTOS
 * ============================================================
 *
 * Archivo:
 * product.ts
 *
 * Tipo:
 * FRONTEND - Angular / TypeScript
 *
 * Responsabilidad:
 *
 * Define la estructura de datos utilizada por Angular
 * para representar un producto.
 *
 * Este modelo sirve como contrato entre:
 *
 * - ProductService
 * - ProductsComponent
 * - API Laravel
 *
 * ============================================================
 */


/**
 * ============================================================
 * INTERFAZ PRODUCT
 * ============================================================
 *
 * Una interfaz de TypeScript define la estructura que debe
 * tener un objeto para ser considerado un Product.
 *
 * No genera código JavaScript durante la ejecución.
 *
 * Su función principal es proporcionar:
 *
 * - Tipado
 * - Autocompletado
 * - Detección de errores
 * - Documentación del modelo
 *
 * ============================================================
 */

export interface Product {


  /**
   * ==========================================================
   * ID DEL PRODUCTO
   * ==========================================================
   *
   * Identificador generado por el backend.
   *
   * En el proyecto actual corresponde al identificador
   * generado por MongoDB y recibido por Angular como string.
   *
   * El campo es opcional (?) porque al crear un producto
   * todavía no conocemos el ID generado por el backend.
   *
   * ==========================================================
   */

  id?: string;


  /**
   * ==========================================================
   * CÓDIGO DEL PRODUCTO
   * ==========================================================
   *
   * Código generado automáticamente por Laravel.
   *
   * Ejemplo observado durante las pruebas:
   *
   * PROD-01M...
   *
   * Este campo es opcional porque Angular no necesita
   * proporcionarlo al crear un producto.
   *
   * El backend es responsable de generarlo.
   *
   * ==========================================================
   */

  code?: string;


  /**
   * ==========================================================
   * NOMBRE DEL PRODUCTO
   * ==========================================================
   *
   * Nombre descriptivo del producto.
   *
   * Ejemplo:
   *
   * "Válvula de prueba"
   *
   * Es obligatorio dentro del modelo:
   *
   * name: string
   *
   * ==========================================================
   */

  name: string;


  /**
   * ==========================================================
   * MARCA DEL PRODUCTO
   * ==========================================================
   *
   * Marca asociada al producto.
   *
   * Ejemplo:
   *
   * "TAP"
   *
   * Es obligatorio dentro del modelo.
   *
   * ==========================================================
   */

  brand: string;


  /**
   * ==========================================================
   * PRECIO DEL PRODUCTO
   * ==========================================================
   *
   * Precio expresado como número.
   *
   * Ejemplo:
   *
   * 250
   *
   * 450
   *
   * 999.99
   *
   * Es obligatorio dentro del modelo.
   *
   * ==========================================================
   */

  price: number;


  /**
   * ==========================================================
   * FECHA DE CREACIÓN
   * ==========================================================
   *
   * Fecha en la que el producto fue creado.
   *
   * Es generada y administrada por el backend.
   *
   * Angular recibe el valor como string.
   *
   * Ejemplo:
   *
   * "2026-08-22T13:45:00.000Z"
   *
   * El campo es opcional porque todavía no existe
   * cuando estamos creando el objeto en el frontend.
   *
   * ==========================================================
   */

  created_at?: string;


  /**
   * ==========================================================
   * FECHA DE ACTUALIZACIÓN
   * ==========================================================
   *
   * Fecha de la última modificación del producto.
   *
   * Es administrada automáticamente por el backend.
   *
   * El campo es opcional porque puede no estar presente
   * en un objeto que todavía no ha sido almacenado.
   *
   * ==========================================================
   */

  updated_at?: string;

}