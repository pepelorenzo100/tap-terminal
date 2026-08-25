/**
 * ============================================================
 * TAP TERMINAL
 * RESET PASSWORD COMPONENT
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/pages/reset-password/
 *     reset-password.component.ts
 *
 * Responsabilidad:
 *
 * Permitir al usuario establecer una nueva contraseña mediante
 * el token recibido por correo electrónico.
 *
 * URL esperada:
 *
 *     /reset-password?token=TOKEN&email=CORREO
 *
 * Flujo:
 *
 *     Correo electrónico
 *          ↓
 *     /reset-password
 *          ↓
 *     token + email
 *          ↓
 *     nueva contraseña
 *          ↓
 *     AuthService.resetPassword()
 *          ↓
 *     POST /api/reset-password
 *          ↓
 *     Laravel
 *          ↓
 *     contraseña actualizada
 *
 * Seguridad:
 *
 * - El token se recibe únicamente mediante query parameters.
 * - El correo recibido se utiliza para identificar la cuenta.
 * - La validación definitiva del token corresponde al backend.
 * - El componente no intenta validar el token localmente.
 *
 * ============================================================
 */

import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  AuthService
} from '../../services/auth.service';


/**
 * ============================================================
 * COMPONENTE
 * ============================================================
 */

@Component({

  selector:
    'app-reset-password',

  standalone:
    true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './reset-password.component.html',

  styleUrl:
    './reset-password.component.css'

})


export class ResetPasswordComponent
  implements OnInit {


  /**
   * ==========================================================
   * DATOS DEL ENLACE DE RECUPERACIÓN
   * ==========================================================
   *
   * Estos valores proceden de:
   *
   *     /reset-password?token=...&email=...
   * ==========================================================
   */

  email =
    '';

  token =
    '';


  /**
   * ==========================================================
   * CONTRASEÑAS
   * ==========================================================
   */

  password =
    '';

  passwordConfirmation =
    '';


  /**
   * ==========================================================
   * ESTADO DE LA INTERFAZ
   * ==========================================================
   */

  loading =
    false;

  completed =
    false;


  /**
   * ==========================================================
   * MENSAJES
   * ==========================================================
   */

  errorMessage =
    '';

  successMessage =
    '';


  /**
   * ==========================================================
   * CONSTRUCTOR
   * ==========================================================
   */

  constructor(

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly authService:
      AuthService

  ) {}


  /**
   * ==========================================================
   * INICIALIZACIÓN
   * ==========================================================
   *
   * Lee los parámetros:
   *
   *     token
   *     email
   *
   * desde la URL.
   * ==========================================================
   */

  ngOnInit(): void {

    this.route
      .queryParamMap
      .subscribe(
        params => {

          /**
           * --------------------------------------------------
           * OBTENER TOKEN
           * --------------------------------------------------
           */

          this.token =
            params.get('token') ?? '';


          /**
           * --------------------------------------------------
           * OBTENER CORREO
           * --------------------------------------------------
           */

          this.email =
            params.get('email') ?? '';


          /**
           * --------------------------------------------------
           * VALIDAR DATOS MÍNIMOS DEL ENLACE
           * --------------------------------------------------
           *
           * No validamos aquí la autenticidad del token.
           *
           * Esa responsabilidad corresponde a Laravel.
           */

          if (
            !this.token ||
            !this.email
          ) {

            this.errorMessage =
              'El enlace de recuperación no es válido.';

          }

        }
      );

  }


  /**
   * ==========================================================
   * RESTABLECER CONTRASEÑA
   * ==========================================================
   *
   * Ejecuta:
   *
   *     POST /api/reset-password
   *
   * Enviando:
   *
   *     {
   *       email,
   *       token,
   *       password,
   *       password_confirmation
   *     }
   *
   * El backend realiza la validación definitiva.
   * ==========================================================
   */

  submit(): void {

    /**
     * --------------------------------------------------------
     * LIMPIAR MENSAJES ANTERIORES
     * --------------------------------------------------------
     */

    this.errorMessage =
      '';

    this.successMessage =
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
     * VALIDAR ENLACE
     * --------------------------------------------------------
     */

    if (
      !this.token ||
      !this.email
    ) {

      this.errorMessage =
        'El enlace de recuperación no es válido.';

      return;

    }


    /**
     * --------------------------------------------------------
     * NORMALIZAR CORREO
     * --------------------------------------------------------
     */

    const normalizedEmail =
      this.email
        .trim()
        .toLowerCase();


    /**
     * --------------------------------------------------------
     * VALIDAR CORREO
     * --------------------------------------------------------
     */

    if (
      !this.isValidEmail(
        normalizedEmail
      )
    ) {

      this.errorMessage =
        'El correo electrónico del enlace no es válido.';

      return;

    }


    /**
     * --------------------------------------------------------
     * VALIDAR NUEVA CONTRASEÑA
     * --------------------------------------------------------
     */

    if (
      !this.password
    ) {

      this.errorMessage =
        'Ingresa una nueva contraseña.';

      return;

    }


    /**
     * --------------------------------------------------------
     * LONGITUD MÍNIMA
     * --------------------------------------------------------
     */

    if (
      this.password.length < 8
    ) {

      this.errorMessage =
        'La contraseña debe tener al menos 8 caracteres.';

      return;

    }


    /**
     * --------------------------------------------------------
     * CONFIRMAR CONTRASEÑA
     * --------------------------------------------------------
     */

    if (
      this.password !==
      this.passwordConfirmation
    ) {

      this.errorMessage =
        'Las contraseñas no coinciden.';

      return;

    }


    /**
     * --------------------------------------------------------
     * GUARDAR CORREO NORMALIZADO
     * --------------------------------------------------------
     */

    this.email =
      normalizedEmail;


    /**
     * --------------------------------------------------------
     * ACTIVAR CARGA
     * --------------------------------------------------------
     */

    this.loading =
      true;


    /**
     * ========================================================
     * ENVIAR SOLICITUD AL BACKEND
     * ========================================================
     */

    this.authService
      .resetPassword(

        this.email,

        this.token,

        this.password,

        this.passwordConfirmation

      )
      .subscribe({

        /**
         * ----------------------------------------------------
         * RESTABLECIMIENTO CORRECTO
         * ----------------------------------------------------
         */

        next:
          (response) => {

            this.successMessage =
              response.message ||
              'La contraseña fue restablecida correctamente.';


            /**
             * ----------------------------------------------
             * MARCAR PROCESO COMO COMPLETADO
             * ----------------------------------------------
             */

            this.completed =
              true;


            /**
             * ----------------------------------------------
             * FINALIZAR CARGA
             * ----------------------------------------------
             */

            this.loading =
              false;


            /**
             * ----------------------------------------------
             * LIMPIAR CONTRASEÑAS DEL FORMULARIO
             * ----------------------------------------------
             *
             * El token y el correo se conservan únicamente
             * para mantener el estado de la página.
             */

            this.password =
              '';

            this.passwordConfirmation =
              '';

          },


        /**
         * ----------------------------------------------------
         * ERROR
         * ----------------------------------------------------
         */

        error:
          (error: Error) => {

            console.error(
              'Error al restablecer contraseña:',
              error
            );


            this.errorMessage =
              error.message ||
              'No fue posible restablecer la contraseña.';


            this.loading =
              false;

          }

      });

  }


  /**
   * ==========================================================
   * VALIDAR CORREO ELECTRÓNICO
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


  /**
   * ==========================================================
   * IR AL LOGIN
   * ==========================================================
   *
   * Después de restablecer correctamente la contraseña,
   * el usuario puede regresar al inicio de sesión.
   * ==========================================================
   */

  goToLogin(): void {

    this.router.navigate([
      '/login'
    ]);

  }

}