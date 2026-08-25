/**
 * ============================================================
 * TAP TERMINAL
 * CONFIGURACIÓN DE RUTAS ANGULAR
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/app.routes.ts
 *
 * Responsabilidad:
 *
 *     Definir las rutas principales de la aplicación Angular.
 *
 * Arquitectura de navegación:
 *
 *     Rutas públicas
 *          ↓
 *     Autenticación / recuperación
 *
 *     Rutas protegidas
 *          ↓
 *     AuthGuard
 *
 *     Rutas administrativas
 *          ↓
 *     AuthGuard
 *          ↓
 *     SectionGuard
 *
 * ============================================================
 *
 * RUTAS PÚBLICAS
 * ============================================================
 *
 *     /login
 *     /forgot-password
 *     /reset-password
 *
 * Estas rutas no requieren autenticación.
 *
 * ============================================================
 *
 * RUTAS PROTEGIDAS
 * ============================================================
 *
 *     /
 *     /products
 *     /users
 *     /profiles
 *     /profile
 *
 * Requieren un token de autenticación válido.
 *
 * ============================================================
 *
 * CONTROL POR SECCIÓN
 * ============================================================
 *
 * Las rutas administrativas utilizan:
 *
 *     sectionGuard
 *
 * La sección requerida se declara mediante:
 *
 *     data: {
 *       sectionCode: 'SEC-...'
 *     }
 *
 * Ejemplo:
 *
 *     /products
 *         ↓
 *     SEC-PRODUCTS
 *
 * El SectionGuard obtiene este valor mediante:
 *
 *     route.data?.['sectionCode']
 *
 * ============================================================
 *
 * SEGURIDAD
 * ============================================================
 *
 * Los guards de Angular controlan la navegación del frontend.
 *
 * La seguridad real de los endpoints continúa siendo
 * responsabilidad de Laravel mediante:
 *
 *     auth:sanctum
 *
 * y los middleware de autorización correspondientes.
 *
 * ============================================================
 */

import {
  Routes
} from '@angular/router';


/**
 * ============================================================
 * COMPONENTES PÚBLICOS
 * ============================================================
 *
 * Estos componentes se cargan directamente porque forman parte
 * del flujo inicial de autenticación.
 * ============================================================
 */

import {
  LoginComponent
} from './pages/login/login.component';

import {
  ForgotPasswordComponent
} from './pages/forgot-password/forgot-password.component';

import {
  ResetPasswordComponent
} from './pages/reset-password/reset-password.component';


/**
 * ============================================================
 * GUARDS
 * ============================================================
 *
 * AuthGuard:
 *
 *     Comprueba que exista un token de autenticación.
 *
 * SectionGuard:
 *
 *     Comprueba que el usuario tenga acceso a la sección
 *     requerida por la ruta.
 * ============================================================
 */

import {
  authGuard
} from './guards/auth.guard';

import {
  sectionGuard
} from './guards/section.guard';


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
   * Ruta pública.
   *
   * URL:
   *
   *     /login
   *
   * Responsabilidad:
   *
   *     Permitir al usuario iniciar sesión.
   *
   * El LoginComponent:
   *
   *     1. Envía las credenciales.
   *     2. Recibe el token Sanctum.
   *     3. Consulta /api/me.
   *     4. Carga usuario, perfiles y secciones.
   *     5. Navega al sistema.
   */

  {
    path: 'login',

    component:
      LoginComponent
  },


  /**
   * ==========================================================
   * RECUPERAR CONTRASEÑA
   * ==========================================================
   *
   * Ruta pública.
   *
   * URL:
   *
   *     /forgot-password
   *
   * Flujo:
   *
   *     usuario
   *        ↓
   *     correo electrónico
   *        ↓
   *     POST /api/forgot-password
   *        ↓
   *     Laravel
   *        ↓
   *     correo de recuperación
   */

  {
    path: 'forgot-password',

    component:
      ForgotPasswordComponent
  },


  /**
   * ==========================================================
   * RESTABLECER CONTRASEÑA
   * ==========================================================
   *
   * Ruta pública.
   *
   * URL:
   *
   *     /reset-password
   *
   * El enlace enviado por correo utiliza query parameters:
   *
   *     ?token=TOKEN&email=CORREO
   *
   * Ejemplo:
   *
   *     /reset-password?token=TOKEN&email=usuario@example.com
   *
   * El ResetPasswordComponent obtiene estos valores mediante
   * ActivatedRoute.
   */

  {
    path: 'reset-password',

    component:
      ResetPasswordComponent
  },


  /**
   * ==========================================================
   * DASHBOARD
   * ==========================================================
   *
   * Ruta protegida por autenticación.
   *
   * URL:
   *
   *     /
   *
   * Guard:
   *
   *     authGuard
   *
   * No requiere una sección administrativa específica.
   *
   * El componente se carga de forma lazy.
   */

  {
    path: '',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import(
        './pages/dashboard/dashboard.component'
      ).then(
        module =>
          module.DashboardComponent
      )
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
   * Sección requerida:
   *
   *     SEC-PRODUCTS
   *
   * Guards:
   *
   *     1. authGuard
   *        Comprueba autenticación.
   *
   *     2. sectionGuard
   *        Comprueba autorización sobre SEC-PRODUCTS.
   *
   * IMPORTANTE:
   *
   * El nombre de la propiedad debe coincidir exactamente
   * con lo que espera section.guard.ts:
   *
   *     sectionCode
   */

  {
    path: 'products',

    canActivate: [
      authGuard,
      sectionGuard
    ],

    data: {
      sectionCode:
        'SEC-PRODUCTS'
    },

    loadComponent: () =>
      import(
        './pages/products/products.component'
      ).then(
        module =>
          module.ProductsComponent
      )
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
   * Sección requerida:
   *
   *     SEC-USERS
   *
   * Guards:
   *
   *     authGuard
   *     sectionGuard
   */

  {
    path: 'users',

    canActivate: [
      authGuard,
      sectionGuard
    ],

    data: {
      sectionCode:
        'SEC-USERS'
    },

    loadComponent: () =>
      import(
        './pages/users/users.component'
      ).then(
        module =>
          module.UsersComponent
      )
  },


  /**
   * ==========================================================
   * PERFILES DE AUTORIZACIÓN
   * ==========================================================
   *
   * URL:
   *
   *     /profiles
   *
   * Sección requerida:
   *
   *     SEC-PROFILES
   *
   * Guards:
   *
   *     authGuard
   *     sectionGuard
   *
   * El SectionGuard comprueba que el usuario tenga la sección
   * SEC-PROFILES dentro de la información cargada mediante
   * /api/me.
   */

  {
    path: 'profiles',

    canActivate: [
      authGuard,
      sectionGuard
    ],

    data: {
      sectionCode:
        'SEC-PROFILES'
    },

    loadComponent: () =>
      import(
        './pages/profiles/profiles.component'
      ).then(
        module =>
          module.ProfilesComponent
      )
  },


  /**
   * ==========================================================
   * PERFIL PERSONAL
   * ==========================================================
   *
   * URL:
   *
   *     /profile
   *
   * Esta ruta requiere autenticación, pero no una sección
   * administrativa específica.
   *
   * Guard:
   *
   *     authGuard
   */

  {
    path: 'profile',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import(
        './pages/profile/profile.component'
      ).then(
        module =>
          module.ProfileComponent
      )
  },


  /**
   * ==========================================================
   * RUTA DESCONOCIDA
   * ==========================================================
   *
   * Cualquier URL que no esté registrada será redirigida
   * al inicio de sesión.
   *
   * Ejemplo:
   *
   *     /ruta-inexistente
   *
   *       ↓
   *
   *     /login
   */

  {
    path: '**',

    redirectTo:
      'login'
  }

];