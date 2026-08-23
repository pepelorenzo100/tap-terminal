/**
 * ============================================================
 * TAP TERMINAL
 * CONFIGURACIÓN DE RUTAS
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/app.routes.ts
 *
 * Responsabilidad:
 *
 * Definir las rutas principales de la aplicación Angular.
 *
 * Módulos actuales:
 *
 *     /login
 *     /products
 *     /users
 *
 * Seguridad:
 *
 * Las rutas administrativas utilizan AuthGuard.
 *
 * Flujo:
 *
 * Angular Router
 *      ↓
 * AuthGuard
 *      ↓
 * Token de autenticación
 *      ↓
 * Componente protegido
 *
 * ============================================================
 */

import { Routes } from '@angular/router';


/**
 * ============================================================
 * COMPONENTES
 * ============================================================
 */

import { LoginComponent } from './pages/login/login.component';

import { ProductsComponent } from './pages/products/products.component';

import { UsersComponent } from './pages/users/users.component';


/**
 * ============================================================
 * GUARD
 * ============================================================
 */

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
   *     /login
   *
   * Esta ruta es pública.
   *
   * El usuario necesita acceder al login antes de
   * disponer de un token de autenticación.
   *
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
   *     /products
   *
   * Esta sección requiere autenticación.
   *
   * AuthGuard comprueba que exista una sesión válida
   * antes de permitir el acceso.
   *
   */

  {
    path: 'products',

    component: ProductsComponent,

    canActivate: [
      authGuard
    ]
  },


  /**
   * ==========================================================
   * USUARIOS
   * ==========================================================
   *
   * URL:
   *
   *     /users
   *
   * Esta sección requiere autenticación.
   *
   * Los usuarios del sistema son información administrativa,
   * por lo que no debe estar disponible públicamente.
   *
   * Flujo:
   *
   *     /users
   *        ↓
   *     authGuard
   *        ↓
   *     UsersComponent
   *
   */

  {
    path: 'users',

    component: UsersComponent,

    canActivate: [
      authGuard
    ]
  },


  /**
   * ==========================================================
   * RUTA RAÍZ
   * ==========================================================
   *
   * URL:
   *
   *     /
   *
   * Por defecto enviamos al usuario al login.
   *
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
   * Cualquier URL que no exista será redirigida al login.
   *
   */

  {
    path: '**',

    redirectTo: 'login'
  }

];