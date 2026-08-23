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
 * Rutas:
 *
 *     /              → Dashboard
 *     /login         → Login
 *     /products      → Productos
 *     /users         → Usuarios
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

import {
  ProductsComponent
} from './pages/products/products.component';

import {
  UsersComponent
} from './pages/users/users.component';

import {
  DashboardComponent
} from './pages/dashboard/dashboard.component';


/**
 * ============================================================
 * GUARD
 * ============================================================
 */

import {
  authGuard
} from './guards/auth.guard';


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
   * Ruta pública.
   *
   * El usuario puede acceder al login sin autenticarse.
   */

  {
    path: 'login',

    component: LoginComponent
  },


  /**
   * ==========================================================
   * DASHBOARD
   * ==========================================================
   *
   * URL:
   *
   *     /
   *
   * El Dashboard es la pantalla principal del sistema.
   *
   * Requiere autenticación.
   *
   * Flujo:
   *
   *     /
   *      ↓
   *     authGuard
   *      ↓
   *     DashboardComponent
   *
   */

  {
    path: '',

    pathMatch: 'full',

    component: DashboardComponent,

    canActivate: [
      authGuard
    ]
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
   * Sección protegida.
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
   * Sección protegida.
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
   * RUTAS DESCONOCIDAS
   * ==========================================================
   *
   * Cualquier URL inexistente será enviada al Dashboard.
   *
   * Ejemplo:
   *
   *     /cualquier-ruta
   *             ↓
   *         Dashboard
   *
   * El AuthGuard impedirá que un usuario no autenticado
   * acceda al Dashboard.
   */

  {
    path: '**',

    redirectTo: ''
  }

];