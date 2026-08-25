/**
 * ============================================================
 * TAP TERMINAL
 * FORGOT PASSWORD COMPONENT
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/pages/forgot-password/
 *     forgot-password.component.ts
 *
 * Responsabilidad:
 *
 *     Gestionar la solicitud de recuperación de contraseña.
 *
 * Flujo:
 *
 *     Usuario
 *        ↓
 *     correo electrónico
 *        ↓
 *     AuthService.forgotPassword()
 *        ↓
 *     POST /api/forgot-password
 *        ↓
 *     Laravel
 *        ↓
 *     PasswordResetToken
 *        ↓
 *     PasswordResetMail
 *        ↓
 *     correo electrónico
 *        ↓
 *     /reset-password
 *
 * Seguridad:
 *
 *     El backend devuelve una respuesta genérica para evitar
 *     revelar si el correo electrónico está registrado.
 *
 *     El frontend mantiene el mismo comportamiento y no
 *     informa si la cuenta existe o no.
 *
 * ============================================================
 */

import {
  CommonModule
} from '@angular/common';

import {
  Component
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
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
    'app-forgot-password',

  standalone:
    true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './forgot-password.component.html',

  styleUrl:
    './forgot-password.component.css'

})


export class ForgotPasswordComponent {


  /**
   * ==========================================================
   * CORREO ELECTRÓNICO
   * ==========================================================
   *
   * Dirección introducida por el usuario.
   */

  email =
    '';


  /**
   * ==========================================================
   * ESTADO DE CARGA
   * ==========================================================
   *
   * true:
   *
   *     Existe una petición activa.
   *
   * false:
   *
   *     No existe ninguna petición activa.
   *
   * Se utiliza para evitar solicitudes duplicadas.
   */

  loading =
    false;


  /**
   * ==========================================================
   * ESTADO DE ENVÍO
   * ==========================================================
   *
   * true:
   *
   *     La solicitud fue procesada correctamente.
   *
   * false:
   *
   *     El formulario continúa disponible.
   */

  submitted =
    false;


  /**
   * ==========================================================
   * MENSAJE DE ERROR
   * ==========================================================
   */

  errorMessage =
    '';


  /**
   * ==========================================================
   * MENSAJE DE ÉXITO
   * ==========================================================
   *
   * El mensaje normalmente será proporcionado por Laravel.
   *
   * Se mantiene un mensaje alternativo para garantizar que
   * la interfaz siempre tenga una respuesta comprensible.
   */

  successMessage =
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
   * SOLICITAR RECUPERACIÓN
   * ==========================================================
   *
   * Ejecuta:
   *
   *     POST /api/forgot-password
   *
   * Datos enviados:
   *
   *     {
   *         email
   *     }
   *
   * El backend:
   *
   *     1. Busca el usuario.
   *     2. Genera un token.
   *     3. Guarda solamente el hash.
   *     4. Envía el correo.
   *     5. Devuelve una respuesta genérica.
   *
   * ============================================================
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
     * NORMALIZAR CORREO
     * --------------------------------------------------------
     *
     * Eliminamos espacios al principio y al final.
     */

    const email =
      this.email
        .trim()
        .toLowerCase();


    /**
     * --------------------------------------------------------
     * VALIDAR CORREO VACÍO
     * --------------------------------------------------------
     */

    if (
      !email
    ) {

      this.errorMessage =
        'Ingresa tu correo electrónico.';

      return;

    }


    /**
     * --------------------------------------------------------
     * VALIDAR FORMATO DEL CORREO
     * --------------------------------------------------------
     */

    if (
      !this.isValidEmail(
        email
      )
    ) {

      this.errorMessage =
        'Ingresa un correo electrónico válido.';

      return;

    }


    /**
     * --------------------------------------------------------
     * CONSERVAR VALOR NORMALIZADO
     * --------------------------------------------------------
     */

    this.email =
      email;


    /**
     * --------------------------------------------------------
     * ACTIVAR ESTADO DE CARGA
     * --------------------------------------------------------
     */

    this.loading =
      true;


    /**
     * ========================================================
     * SOLICITAR RECUPERACIÓN AL BACKEND
     * ========================================================
     */

    this.authService
      .forgotPassword(
        email
      )
      .subscribe({

        /**
         * ====================================================
         * RESPUESTA CORRECTA
         * ====================================================
         */

        next:
          (response) => {

            /**
             * ----------------------------------------------
             * MOSTRAR RESPUESTA DEL BACKEND
             * ----------------------------------------------
             *
             * Laravel devuelve actualmente un mensaje
             * genérico para no revelar la existencia de
             * la cuenta.
             */

            this.successMessage =
              response.message ||
              'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.';


            /**
             * ----------------------------------------------
             * BLOQUEAR EL FORMULARIO
             * ----------------------------------------------
             */

            this.submitted =
              true;


            /**
             * ----------------------------------------------
             * FINALIZAR CARGA
             * ----------------------------------------------
             */

            this.loading =
              false;

          },


        /**
         * ====================================================
         * ERROR
         * ====================================================
         */

        error:
          (error: Error) => {

            console.error(
              'Error al solicitar recuperación de contraseña:',
              error
            );


            /**
             * ----------------------------------------------
             * MOSTRAR ERROR
             * ----------------------------------------------
             */

            this.errorMessage =
              error.message ||
              'No fue posible solicitar la recuperación de contraseña.';


            /**
             * ----------------------------------------------
             * FINALIZAR CARGA
             * ----------------------------------------------
             */

            this.loading =
              false;

          }

      });

  }


  /**
   * ==========================================================
   * VALIDAR CORREO ELECTRÓNICO
   * ==========================================================
   *
   * Validación básica del lado del cliente.
   *
   * La validación definitiva también corresponde al backend.
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
   * VOLVER AL LOGIN
   * ==========================================================
   *
   * Navega hacia:
   *
   *     /login
   */

  goToLogin(): void {

    this.router.navigate([
      '/login'
    ]);

  }

}