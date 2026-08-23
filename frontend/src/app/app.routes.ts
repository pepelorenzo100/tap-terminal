/**
 * ============================================================
 * CONFIGURACIÓN DE RUTAS DE LA APLICACIÓN
 * ============================================================
 *
 * Este archivo contiene la configuración de navegación del
 * frontend Angular.
 *
 * RESPONSABILIDAD:
 *
 * Define las diferentes URL que podrá utilizar la aplicación
 * para mostrar sus diferentes vistas o componentes.
 *
 * La navegación se mantiene separada de la lógica de negocio.
 * La comunicación con la API de Laravel será responsabilidad
 * de los servicios correspondientes, como ProductService.
 *
 * ARQUITECTURA:
 *
 * app.config.ts
 *      ↓
 * proporciona el Router
 *      ↓
 * app.routes.ts
 *      ↓
 * define las rutas
 *      ↓
 * Router
 *      ↓
 * RouterOutlet
 *      ↓
 * muestra el componente correspondiente
 */

/*
 * ============================================================
 * IMPORTACIONES
 * ============================================================
 *
 * Routes:
 *
 * Es el tipo proporcionado por Angular Router que representa
 * una colección de configuraciones de rutas.
 */

import { Routes } from '@angular/router';


/*
 * ============================================================
 * IMPORTACIÓN DEL COMPONENTE DE PRODUCTOS
 * ============================================================
 *
 * ProductsComponent representa la pantalla de productos.
 *
 * Se utilizará cuando el usuario visite:
 *
 * /products
 *
 * La ruta solamente controla la navegación.
 * La comunicación con Laravel seguirá siendo responsabilidad
 * de ProductService.
 */

import { ProductsComponent } from './pages/products/products.component';


/*
 * ============================================================
 * COLECCIÓN PRINCIPAL DE RUTAS
 * ============================================================
 *
 * Aquí se registran las rutas disponibles en la aplicación.
 */

export const routes: Routes = [

  /*
   * ==========================================================
   * RUTA DE PRODUCTOS
   * ==========================================================
   *
   * path:
   * Define la URL que utilizará el usuario.
   *
   * component:
   * Define el componente que Angular debe mostrar.
   *
   * Flujo:
   *
   * /products
   *      ↓
   * Angular Router
   *      ↓
   * ProductsComponent
   *      ↓
   * router-outlet
   */

  {
    path: 'products',
    component: ProductsComponent
  }

];