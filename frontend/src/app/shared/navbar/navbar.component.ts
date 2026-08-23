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
 * Este componente representa el menú principal de navegación
 * del sistema TAP Terminal.
 *
 * Opciones:
 *
 *     - Productos
 *     - Usuarios
 *     - Cerrar sesión
 *
 * Arquitectura:
 *
 *     NavbarComponent
 *          |
 *          +----> Angular Router
 *          |
 *          +----> AuthService
 *                         |
 *                         +----> Laravel API
 *
 * Seguridad:
 *
 * La existencia del token se consulta mediante AuthService.
 *
 * IMPORTANTE:
 *
 * Este componente NO sustituye al AuthGuard.
 *
 * Las rutas protegidas continúan dependiendo del sistema
 * de autenticación de Angular y Laravel Sanctum.
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
 *
 * AuthService se encuentra en:
 *
 *     src/app/services/auth.service.ts
 *
 * Se utiliza para:
 *
 *     - comprobar si existe sesión
 *     - cerrar sesión
 *     - eliminar el token local
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
   * Selector utilizado por Angular.
   */

  selector: 'app-navbar',


  /**
   * Componente standalone.
   *
   * No pertenece a un NgModule tradicional.
   */

  standalone: true,


  /**
   * Dependencias utilizadas directamente
   * por navbar.component.html.
   */

  imports: [

    /**
     * Permite utilizar:
     *
     * routerLink="/products"
     * routerLink="/users"
     */

    RouterLink,


    /**
     * Permite marcar visualmente la ruta activa.
     */

    RouterLinkActive

  ],


  /**
   * Plantilla HTML del menú.
   */

  templateUrl:
    './navbar.component.html',


  /**
   * Estilos específicos del menú.
   */

  styleUrl:
    './navbar.component.css'

})


/**
 * ============================================================
 * CLASE NAVBAR COMPONENT
 * ============================================================
 */

export class NavbarComponent {


  /**
   * ==========================================================
   * CONSTRUCTOR
   * ==========================================================
   *
   * AuthService:
   *
   * Centraliza la autenticación de la aplicación.
   *
   * Router:
   *
   * Permite realizar navegación programática.
   */

  constructor(

    private readonly authService:
      AuthService,

    private readonly router:
      Router

  ) {}


  /**
   * ==========================================================
   * ESTADO DE AUTENTICACIÓN
   * ==========================================================
   *
   * Devuelve true cuando existe un token guardado
   * en localStorage.
   *
   * El token es administrado por AuthService.
   */

  get isAuthenticated(): boolean {

    return this.authService
      .isAuthenticated();

  }


  /**
   * ==========================================================
   * CERRAR SESIÓN
   * ==========================================================
   *
   * Flujo:
   *
   *     Usuario
   *        ↓
   *     Navbar
   *        ↓
   *     AuthService.logout()
   *        ↓
   *     POST /api/logout
   *        ↓
   *     Laravel Sanctum
   *        ↓
   *     eliminar token local
   *        ↓
   *     /login
   *
   * Si el servidor responde correctamente:
   *
   *     1. Eliminamos el token.
   *     2. Redirigimos al login.
   *
   * Si ocurre un error:
   *
   *     También eliminamos el token local.
   *
   * Esto evita que el navegador conserve una sesión
   * que ya no es válida en Laravel.
   */

  logout(): void {

    this.authService
      .logout()
      .subscribe({

        /**
         * ================================================
         * LOGOUT CORRECTO
         * ================================================
         */

        next: () => {

          /**
           * Eliminar token almacenado.
           */

          this.authService
            .clearToken();


          /**
           * Regresar a la pantalla de login.
           */

          this.router
            .navigate([
              '/login'
            ]);

        },


        /**
         * ================================================
         * ERROR DURANTE LOGOUT
         * ================================================
         */

        error: (error: unknown) => {

          /**
           * Mostrar el error en consola para facilitar
           * diagnóstico durante desarrollo.
           */

          console.error(
            'Error al cerrar sesión:',
            error
          );


          /**
           * Aunque Laravel haya fallado, eliminamos
           * el token local.
           */

          this.authService
            .clearToken();


          /**
           * Regresar al login.
           */

          this.router
            .navigate([
              '/login'
            ]);

        }

      });

  }

}