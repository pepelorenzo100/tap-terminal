/**
 * ============================================================
 * TAP TERMINAL
 * CONFIGURACIÓN DE RUTAS
 * ============================================================
 *
 * Archivo:
 * app.routes.ts
 *
 * Responsabilidad:
 *
 * Definir las rutas principales del frontend Angular.
 *
 * Rutas:
 *
 * /login
 * /products
 *
 * También se define:
 *
 * - Redirección de la ruta raíz.
 * - Redirección de rutas desconocidas.
 * - Protección de /products mediante AuthGuard.
 *
 * Arquitectura:
 *
 * Angular Router
 *      ↓
 * app.routes.ts
 *      ↓
 * AuthGuard
 *      ↓
 * Component
 *
 * ============================================================
 */

import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';

import { ProductsComponent } from './pages/products/products.component';

import { authGuard } from './guards/auth.guard';


/**
 * ============================================================
 * RUTAS DE LA APLICACIÓN
 * ============================================================
 */

export const routes: Routes = [

  /**
   * ==========================================================
   * LOGIN
   * ==========================================================
   *
   * URL:
   *
   * /login
   *
   * Esta ruta es pública.
   *
   * No utiliza AuthGuard porque el usuario necesita
   * poder acceder al formulario de inicio de sesión
   * sin estar autenticado.
   */

  {
    path: 'login',
    component: LoginComponent
  },


  /**
   * ==========================================================
   * PRODUCTOS
   * ==========================================================
   *
   * URL:
   *
   * /products
   *
   * Esta ruta requiere autenticación.
   *
   * Antes de mostrar ProductsComponent, Angular ejecuta:
   *
   * authGuard
   *
   * Si existe un token:
   *
   * AuthGuard
   *     ↓
   * true
   *     ↓
   * ProductsComponent
   *
   * Si no existe un token:
   *
   * AuthGuard
   *     ↓
   * /login
   */

  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [authGuard]
  },


  /**
   * ==========================================================
   * RUTA RAÍZ
   * ==========================================================
   *
   * URL:
   *
   * /
   *
   * Redirige al usuario hacia /login.
   */

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },


  /**
   * ==========================================================
   * RUTAS DESCONOCIDAS
   * ==========================================================
   *
   * Si el usuario escribe una URL que no existe,
   * Angular lo devuelve al login.
   */

  {
    path: '**',
    redirectTo: 'login'
  }

];