/**
 * ============================================================
 * TAP TERMINAL
 * LOGIN COMPONENT
 * ============================================================
 *
 * Archivo:
 * login.component.ts
 *
 * Responsabilidad:
 *
 * Gestionar la pantalla de inicio de sesión del usuario.
 *
 * Flujo:
 *
 * LoginComponent
 *      ↓
 * AuthService
 *      ↓
 * POST /api/login
 *      ↓
 * Laravel Sanctum
 *      ↓
 * Token Bearer
 *      ↓
 * localStorage
 *
 * ============================================================
 */

import {
  Component
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

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
  selector: 'app-login',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './login.component.html',

  styleUrl: './login.component.css'
})
export class LoginComponent {


  /**
   * ==========================================================
   * CAMPOS DEL FORMULARIO
   * ==========================================================
   */

  email = '';

  password = '';


  /**
   * ==========================================================
   * ESTADO DE LA INTERFAZ
   * ==========================================================
   */

  loading = false;

  errorMessage = '';


  /**
   * ==========================================================
   * CONSTRUCTOR
   * ==========================================================
   */

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}


  /**
   * ==========================================================
   * INICIAR SESIÓN
   * ==========================================================
   */

  login(): void {

    /**
     * Limpiamos el mensaje anterior.
     */

    this.errorMessage = '';


    /**
     * Evitamos enviar múltiples peticiones mientras
     * la autenticación está en proceso.
     */

    if (this.loading) {
      return;
    }


    /**
     * Validación básica del frontend.
     *
     * La validación definitiva continúa siendo responsabilidad
     * de Laravel.
     */

    if (!this.email.trim()) {

      this.errorMessage =
        'Ingresa tu correo electrónico.';

      return;
    }


    if (!this.password) {

      this.errorMessage =
        'Ingresa tu contraseña.';

      return;
    }


    /**
     * Indicamos que la petición está en proceso.
     */

    this.loading = true;


    /**
     * Llamamos al servicio de autenticación.
     */

    this.authService
      .login(
        this.email,
        this.password,
        'TAP Terminal Web'
      )
      .subscribe({

        /**
         * ====================================================
         * LOGIN CORRECTO
         * ====================================================
         */

        next: (response) => {

          /**
           * Guardamos el token recibido por Laravel.
           */

          this.authService.setToken(
            response.data.token
          );


          /**
           * Redirigimos al módulo de productos.
           */

          this.router.navigate([
            '/products'
          ]);

        },


        /**
         * ====================================================
         * ERROR
         * ====================================================
         */

        error: (error: Error) => {

          this.errorMessage =
            error.message;

          this.loading = false;
        },


        /**
         * ====================================================
         * FINALIZACIÓN
         * ====================================================
         */

        complete: () => {

          this.loading = false;
        }

      });
  }
}