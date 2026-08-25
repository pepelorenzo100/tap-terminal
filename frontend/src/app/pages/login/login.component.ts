/**
 * ============================================================
 * TAP TERMINAL
 * LOGIN COMPONENT
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/pages/login/login.component.ts
 *
 * Responsabilidad:
 *
 * Gestionar:
 *
 * - Inicio de sesión.
 * - Solicitud de recuperación de contraseña.
 *
 * Flujo de inicio de sesión:
 *
 *     LoginComponent
 *          ↓
 *     AuthService.login()
 *          ↓
 *     POST /api/login
 *          ↓
 *     Token Sanctum
 *          ↓
 *     AuthService.me()
 *          ↓
 *     GET /api/me
 *          ↓
 *     Usuario
 *     Perfiles
 *     Secciones
 *          ↓
 *     /products
 *
 * Flujo de recuperación:
 *
 *     LoginComponent
 *          ↓
 *     AuthService.forgotPassword()
 *          ↓
 *     POST /api/forgot-password
 *          ↓
 *     Laravel
 *          ↓
 *     Correo de recuperación
 *          ↓
 *     /reset-password
 *
 * IMPORTANTE:
 *
 * La autorización se carga mediante /api/me antes de navegar
 * al área administrativa.
 *
 * ============================================================
 */

import { CommonModule } from '@angular/common';

import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';


/**
 * ============================================================
 * COMPONENTE
 * ============================================================
 */

@Component({

  selector:
    'app-login',

  standalone:
    true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './login.component.html',

  styleUrl:
    './login.component.css'

})


/**
 * ============================================================
 * LOGIN COMPONENT
 * ============================================================
 */

export class LoginComponent {


  /**
   * ==========================================================
   * CREDENCIALES
   * ==========================================================
   */

  email =
    '';

  password =
    '';


  /**
   * ==========================================================
   * ESTADO DEL LOGIN
   * ==========================================================
   */

  loading =
    false;

  errorMessage =
    '';


  /**
   * ==========================================================
   * ESTADO DE RECUPERACIÓN
   * ==========================================================
   *
   * showForgotPassword:
   *
   *     false → muestra login.
   *     true  → muestra recuperación.
   *
   * forgotPasswordEmail:
   *
   *     Correo utilizado para solicitar la recuperación.
   *
   * forgotPasswordLoading:
   *
   *     Indica que existe una solicitud activa.
   *
   * forgotPasswordMessage:
   *
   *     Mensaje genérico devuelto por Laravel.
   */

  showForgotPassword =
    false;

  forgotPasswordEmail =
    '';

  forgotPasswordLoading =
    false;

  forgotPasswordMessage =
    '';


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
   * INICIAR SESIÓN
   * ==========================================================
   *
   * Ejecuta:
   *
   *     POST /api/login
   *
   * Después:
   *
   *     GET /api/me
   *
   * Solamente se navega al sistema cuando ambas operaciones
   * terminan correctamente.
   */

  login(): void {

    /**
     * --------------------------------------------------------
     * LIMPIAR ERROR
     * --------------------------------------------------------
     */

    this.errorMessage =
      '';


    /**
     * --------------------------------------------------------
     * EVITAR PETICIONES DUPLICADAS
     * --------------------------------------------------------
     */

    if (
      this.loading
    ) {

      return;

    }


    /**
     * --------------------------------------------------------
     * VALIDAR CORREO
     * --------------------------------------------------------
     */

    const email =
      this.email.trim();


    if (
      !email
    ) {

      this.errorMessage =
        'Ingresa tu correo electrónico.';

      return;

    }


    /**
     * --------------------------------------------------------
     * VALIDAR CONTRASEÑA
     * --------------------------------------------------------
     */

    if (
      !this.password
    ) {

      this.errorMessage =
        'Ingresa tu contraseña.';

      return;

    }


    /**
     * --------------------------------------------------------
     * ACTIVAR CARGA
     * --------------------------------------------------------
     */

    this.loading =
      true;


    /**
     * ========================================================
     * AUTENTICAR
     * ========================================================
     */

    this.authService
      .login(
        email,
        this.password,
        'TAP Terminal Web'
      )
      .subscribe({

        /**
         * ----------------------------------------------------
         * LOGIN CORRECTO
         * ----------------------------------------------------
         */

        next: () => {

          this.loadAuthorization();

        },


        /**
         * ----------------------------------------------------
         * LOGIN INCORRECTO
         * ----------------------------------------------------
         */

        error: (
          error: Error
        ) => {

          console.error(
            'Error de inicio de sesión:',
            error
          );


          this.errorMessage =
            error.message ||
            'No fue posible iniciar sesión.';


          this.loading =
            false;

        }

      });

  }


  /**
   * ==========================================================
   * CARGAR AUTORIZACIÓN
   * ==========================================================
   *
   * Ejecuta:
   *
   *     GET /api/me
   *
   * La respuesta contiene:
   *
   * - usuario;
   * - perfiles de autorización;
   * - secciones autorizadas.
   *
   * Estos datos quedan almacenados en AuthService.
   */

  private loadAuthorization(): void {

    this.authService
      .me()
      .subscribe({

        /**
         * ----------------------------------------------------
         * AUTORIZACIÓN CARGADA
         * ----------------------------------------------------
         */

        next: (
          response
        ) => {

          console.log(
            'Autorización cargada correctamente:',
            response.data
          );


          console.log(
            'Secciones autorizadas:',
            this.authService.getSections()
          );


          console.log(
            'Puede acceder a Perfiles:',
            this.authService.hasSection(
              'SEC-PROFILES'
            )
          );


          /**
           * --------------------------------------------------
           * NAVEGACIÓN
           * --------------------------------------------------
           *
           * El usuario ya está autenticado y sus permisos
           * ya fueron cargados.
           */

          this.router
            .navigate([
              '/products'
            ])
            .then(
              () => {

                this.loading =
                  false;

              }
            )
            .catch(
              (error) => {

                console.error(
                  'Error al navegar después del login:',
                  error
                );


                this.errorMessage =
                  'La sesión inició correctamente, ' +
                  'pero no fue posible abrir el sistema.';


                this.loading =
                  false;

              }
            );

        },


        /**
         * ----------------------------------------------------
         * ERROR AL CARGAR AUTORIZACIÓN
         * ----------------------------------------------------
         */

        error: (
          error: Error
        ) => {

          console.error(
            'Error al cargar autorización:',
            error
          );


          /**
           * Si /api/me falla después del login,
           * eliminamos completamente el estado local.
           */

          this.authService
            .clearAuthenticationState();


          this.errorMessage =
            error.message ||
            'No fue posible cargar la autorización del usuario.';


          this.loading =
            false;

        }

      });

  }


  /**
   * ==========================================================
   * MOSTRAR RECUPERACIÓN DE CONTRASEÑA
   * ==========================================================
   *
   * Cambia la interfaz del login al formulario de recuperación.
   *
   * Si el usuario ya escribió un correo en el login, se reutiliza
   * automáticamente.
   */

  openForgotPassword(): void {

    this.showForgotPassword =
      true;


    this.forgotPasswordEmail =
      this.email.trim();


    this.forgotPasswordMessage =
      '';

    this.errorMessage =
      '';

  }


  /**
   * ==========================================================
   * CERRAR RECUPERACIÓN
   * ==========================================================
   */

  closeForgotPassword(): void {

    /**
     * No permitimos cambiar de formulario mientras existe
     * una solicitud activa.
     */

    if (
      this.forgotPasswordLoading
    ) {

      return;

    }


    this.showForgotPassword =
      false;


    this.forgotPasswordMessage =
      '';

    this.errorMessage =
      '';

  }


  /**
   * ==========================================================
   * SOLICITAR RECUPERACIÓN
   * ==========================================================
   *
   * Ejecuta:
   *
   *     POST /api/forgot-password
   *
   * El backend devuelve una respuesta genérica para no revelar
   * si el correo existe en el sistema.
   */

  requestPasswordReset(): void {

    /**
     * --------------------------------------------------------
     * LIMPIAR MENSAJES
     * --------------------------------------------------------
     */

    this.errorMessage =
      '';

    this.forgotPasswordMessage =
      '';


    /**
     * --------------------------------------------------------
     * EVITAR PETICIONES DUPLICADAS
     * --------------------------------------------------------
     */

    if (
      this.forgotPasswordLoading
    ) {

      return;

    }


    /**
     * --------------------------------------------------------
     * NORMALIZAR CORREO
     * --------------------------------------------------------
     */

    const normalizedEmail =
      this.forgotPasswordEmail
        .trim()
        .toLowerCase();


    /**
     * --------------------------------------------------------
     * VALIDAR CORREO
     * --------------------------------------------------------
     */

    if (
      !normalizedEmail
    ) {

      this.errorMessage =
        'Ingresa tu correo electrónico.';

      return;

    }


    if (
      !this.isValidEmail(
        normalizedEmail
      )
    ) {

      this.errorMessage =
        'Ingresa un correo electrónico válido.';

      return;

    }


    /**
     * --------------------------------------------------------
     * ACTIVAR CARGA
     * --------------------------------------------------------
     */

    this.forgotPasswordLoading =
      true;


    /**
     * ========================================================
     * SOLICITAR ENLACE
     * ========================================================
     */

    this.authService
      .forgotPassword(
        normalizedEmail
      )
      .subscribe({

        /**
         * ----------------------------------------------------
         * RESPUESTA CORRECTA
         * ----------------------------------------------------
         */

        next: (
          response
        ) => {

          this.forgotPasswordMessage =
            response.message ||
            'Si el correo está registrado, ' +
            'recibirás instrucciones para recuperar ' +
            'tu contraseña.';


          this.forgotPasswordEmail =
            normalizedEmail;


          this.forgotPasswordLoading =
            false;

        },


        /**
         * ----------------------------------------------------
         * ERROR
         * ----------------------------------------------------
         */

        error: (
          error: Error
        ) => {

          console.error(
            'Error al solicitar recuperación de contraseña:',
            error
          );


          this.errorMessage =
            error.message ||
            'No fue posible solicitar la recuperación de contraseña.';


          this.forgotPasswordLoading =
            false;

        }

      });

  }


  /**
   * ==========================================================
   * VALIDAR CORREO
   * ==========================================================
   */

  private isValidEmail(
    email: string
  ): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(
        email
      );

  }

}