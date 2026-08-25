/**
 * ============================================================
 * TAP TERMINAL
 * APP COMPONENT
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/app.component.ts
 *
 * Responsabilidad:
 *
 *     Componente raíz de la aplicación Angular.
 *
 * Funciones:
 *
 *     - Mostrar el Navbar.
 *     - Proporcionar el RouterOutlet.
 *     - Recuperar la sesión existente al arrancar la aplicación.
 *
 * ============================================================
 *
 * RESTAURACIÓN DE SESIÓN
 * ============================================================
 *
 * Cuando el navegador recarga directamente una ruta protegida,
 * Angular crea nuevamente los servicios en memoria.
 *
 * El token permanece almacenado, pero los datos obtenidos desde
 * /api/me se encuentran inicialmente vacíos.
 *
 * Por ese motivo, cuando existe un token:
 *
 *     AuthService.me()
 *
 * vuelve a consultar:
 *
 *     GET /api/me
 *
 * y recupera:
 *
 *     - usuario autenticado
 *     - perfiles de autorización
 *     - secciones autorizadas
 *
 * Esto permite que las rutas directas como:
 *
 *     /users
 *     /products
 *     /profiles
 *
 * puedan iniciar correctamente después de una recarga.
 *
 * ============================================================
 */

import {
  Component,
  OnInit
} from '@angular/core';

import {
  RouterOutlet
} from '@angular/router';

import {
  NavbarComponent
} from './shared/navbar/navbar.component';

import {
  AuthService
} from './services/auth.service';


/**
 * ============================================================
 * APP COMPONENT
 * ============================================================
 */

@Component({

  /**
   * Selector del componente raíz.
   */

  selector:
    'app-root',

  /**
   * Aplicación standalone.
   */

  standalone:
    true,

  /**
   * Componentes y directivas utilizados por la plantilla.
   */

  imports: [

    /**
     * Menú principal.
     */

    NavbarComponent,

    /**
     * Contenedor de las rutas.
     */

    RouterOutlet

  ],

  /**
   * Plantilla principal.
   */

  templateUrl:
    './app.component.html',

  /**
   * Estilos principales del componente raíz.
   */

  styleUrl:
    './app.component.css'

})


/**
 * ============================================================
 * CLASE PRINCIPAL
 * ============================================================
 */

export class AppComponent
  implements OnInit {


  /**
   * ==========================================================
   * CONSTRUCTOR
   * ==========================================================
   *
   * AuthService se utiliza para comprobar si existe una sesión
   * almacenada y recuperar nuevamente los datos del usuario.
   */

  constructor(
    private readonly authService:
      AuthService
  ) {}


  /**
   * ==========================================================
   * INICIALIZACIÓN
   * ==========================================================
   *
   * Si existe un token local, solicitamos nuevamente /api/me.
   *
   * Si no existe token, no realizamos ninguna petición.
   *
   * El backend continúa siendo responsable de validar realmente
   * la autenticación mediante Sanctum.
   */

  ngOnInit(): void {

    /**
     * --------------------------------------------------------
     * COMPROBAR TOKEN
     * --------------------------------------------------------
     */

    const token =
      this.authService.getToken();


    /**
     * --------------------------------------------------------
     * SIN SESIÓN
     * --------------------------------------------------------
     *
     * El usuario todavía no está autenticado.
     *
     * No necesitamos consultar /api/me.
     */

    if (!token) {

      return;

    }


    /**
     * --------------------------------------------------------
     * RESTAURAR SESIÓN
     * --------------------------------------------------------
     *
     * AuthService.me() actualiza internamente:
     *
     *     userSubject
     *     profilesSubject
     *     sectionsSubject
     *
     * Si el token ya no es válido, AuthService se encarga
     * del manejo correspondiente del error.
     */

    this.authService
      .me()
      .subscribe({

        /**
         * ------------------------------------------------------
         * SESIÓN RECUPERADA
         * ------------------------------------------------------
         *
         * No necesitamos hacer nada adicional.
         *
         * El AuthService ya actualizó sus estados internos.
         */

        next:
          () => {
            // La sesión fue restaurada correctamente.
          },

        /**
         * ------------------------------------------------------
         * ERROR
         * ------------------------------------------------------
         *
         * El manejo específico del error corresponde al
         * AuthService.
         *
         * No lanzamos excepciones desde AppComponent.
         */

        error:
          (error: unknown) => {

            console.error(
              'No fue posible restaurar la sesión:',
              error
            );

          }

      });

  }

}