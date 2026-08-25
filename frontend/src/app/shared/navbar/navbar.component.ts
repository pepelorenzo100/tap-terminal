/**
 * ============================================================
 * TAP TERMINAL
 * NAVBAR COMPONENT
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/shared/navbar/navbar.component.ts
 *
 * Responsabilidad:
 *
 *     Controlar la navegación principal de TAP Terminal.
 *
 * Autorización:
 *
 *     El componente consulta AuthService para determinar
 *     qué secciones puede visualizar el usuario.
 *
 * Secciones:
 *
 *     SEC-PRODUCTS
 *     SEC-USERS
 *     SEC-PROFILES
 *
 * IMPORTANTE:
 *
 *     Este componente solamente controla la visibilidad
 *     de los enlaces.
 *
 *     NO constituye una medida de seguridad.
 *
 * La seguridad real continúa dependiendo de:
 *
 *     Angular AuthGuard
 *     +
 *     Laravel Sanctum
 *     +
 *     autorización del backend
 *
 * ============================================================
 */


/**
 * ============================================================
 * IMPORTACIONES DE ANGULAR
 * ============================================================
 */

import {
  Component
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';


/**
 * ============================================================
 * SERVICIO DE AUTENTICACIÓN
 * ============================================================
 */

import {
  AuthService
} from '../../services/auth.service';


/**
 * ============================================================
 * NAVBAR COMPONENT
 * ============================================================
 */

@Component({

  /**
   * Selector del componente.
   */

  selector: 'app-navbar',


  /**
   * Componente standalone.
   */

  standalone: true,


  /**
   * Dependencias utilizadas por la plantilla.
   */

  imports: [

    RouterLink,

    RouterLinkActive

  ],


  /**
   * Plantilla.
   */

  templateUrl:
    './navbar.component.html',


  /**
   * Estilos.
   */

  styleUrl:
    './navbar.component.css'

})


export class NavbarComponent {


  /**
   * ==========================================================
   * CONSTRUCTOR
   * ==========================================================
   */

  constructor(

    private readonly authService:
      AuthService,

    private readonly router:
      Router

  ) {}


  /**
   * ==========================================================
   * AUTENTICACIÓN
   * ==========================================================
   *
   * Indica si existe un token almacenado localmente.
   *
   * La validez real del token la determina Laravel Sanctum.
   */

  get isAuthenticated(): boolean {

    return this.authService
      .isAuthenticated();

  }


  /**
   * ==========================================================
   * ACCESO A PRODUCTOS
   * ==========================================================
   *
   * Sección:
   *
   *     SEC-PRODUCTS
   *
   * Si el usuario posee esta sección se muestra
   * el enlace Productos.
   */

  get canAccessProducts(): boolean {

    return this.authService
      .hasSection('SEC-PRODUCTS');

  }


  /**
   * ==========================================================
   * ACCESO A USUARIOS
   * ==========================================================
   *
   * Sección:
   *
   *     SEC-USERS
   *
   * Si el usuario posee esta sección se muestra
   * el enlace Usuarios.
   */

  get canAccessUsers(): boolean {

    return this.authService
      .hasSection('SEC-USERS');

  }


  /**
   * ==========================================================
   * ACCESO A PERFILES DE AUTORIZACIÓN
   * ==========================================================
   *
   * Sección:
   *
   *     SEC-PROFILES
   *
   * Si el usuario posee esta sección se muestra
   * el enlace Perfiles.
   */

  get canAccessProfiles(): boolean {

    return this.authService
      .hasSection('SEC-PROFILES');

  }


  /**
   * ==========================================================
   * CERRAR SESIÓN
   * ==========================================================
   *
   * Flujo:
   *
   *     Navbar
   *        ↓
   *     AuthService.logout()
   *        ↓
   *     POST /api/logout
   *        ↓
   *     Laravel Sanctum
   *        ↓
   *     revocar token
   *        ↓
   *     limpiar estado Angular
   *        ↓
   *     /login
   *
   */

  logout(): void {

    this.authService
      .logout()
      .subscribe({

        /**
         * ====================================================
         * LOGOUT CORRECTO
         * ====================================================
         */

        next: () => {

          /*
          |--------------------------------------------------------------------------
          | AuthService ya limpia:
          |
          | - token
          | - usuario
          | - perfiles
          | - secciones
          |--------------------------------------------------------------------------
          */

          this.router
            .navigate([
              '/login'
            ]);

        },


        /**
         * ====================================================
         * ERROR DURANTE LOGOUT
         * ====================================================
         *
         * Aunque Laravel no responda correctamente,
         * eliminamos la sesión local.
         */

        error: (error: unknown) => {

          console.error(
            'Error al cerrar sesión:',
            error
          );


          /*
          |--------------------------------------------------------------------------
          | LIMPIAR ESTADO LOCAL
          |--------------------------------------------------------------------------
          */

          this.authService
            .clearAuthenticationState();


          /*
          |--------------------------------------------------------------------------
          | VOLVER AL LOGIN
          |--------------------------------------------------------------------------
          */

          this.router
            .navigate([
              '/login'
            ]);

        }

      });

  }

}