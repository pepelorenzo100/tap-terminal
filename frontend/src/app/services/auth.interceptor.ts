/**
 * ============================================================
 * TAP TERMINAL
 * INTERCEPTOR DE AUTENTICACIÓN
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/services/auth.interceptor.ts
 *
 * Responsabilidad:
 *
 *     Centralizar el comportamiento de autenticación de las
 *     peticiones HTTP realizadas mediante Angular HttpClient.
 *
 * Funciones:
 *
 *     1. Obtener el token Sanctum.
 *     2. Agregar automáticamente el header Authorization.
 *     3. Enviar las peticiones públicas sin token cuando no
 *        existe una sesión autenticada.
 *     4. Detectar respuestas HTTP 401.
 *     5. Limpiar completamente el estado de autenticación.
 *     6. Redirigir al login cuando la sesión deja de ser válida.
 *
 * Flujo normal:
 *
 *     Angular
 *        ↓
 *     HttpClient
 *        ↓
 *     AuthInterceptor
 *        ↓
 *     Authorization: Bearer TOKEN
 *        ↓
 *     Laravel
 *        ↓
 *     Sanctum
 *
 * Flujo de sesión inválida:
 *
 *     Laravel
 *        ↓
 *     HTTP 401
 *        ↓
 *     AuthInterceptor
 *        ↓
 *     clearAuthenticationState()
 *        ↓
 *     /login
 *
 * ============================================================
 *
 * IMPORTANTE
 * ============================================================
 *
 * Este interceptor no sustituye la autenticación de Laravel.
 *
 * Laravel continúa siendo responsable de validar:
 *
 *     auth:sanctum
 *
 * El interceptor solamente administra la comunicación entre
 * Angular y la API y mantiene consistente el estado local de
 * autenticación.
 *
 * ============================================================
 */

import {
  inject
} from '@angular/core';

import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import {
  Router
} from '@angular/router';

import {
  catchError,
  throwError
} from 'rxjs';

import {
  AuthService
} from './auth.service';


/**
 * ============================================================
 * INTERCEPTOR DE AUTENTICACIÓN
 * ============================================================
 *
 * Interceptor funcional de Angular.
 *
 * Se ejecuta automáticamente para las peticiones realizadas
 * mediante HttpClient.
 *
 * ============================================================
 */

export const authInterceptor: HttpInterceptorFn = (
  request,
  next
) => {

  /**
   * ==========================================================
   * SERVICIOS
   * ==========================================================
   */

  const authService =
    inject(AuthService);

  const router =
    inject(Router);


  /**
   * ==========================================================
   * OBTENER TOKEN
   * ==========================================================
   *
   * AuthService es la única fuente utilizada para obtener
   * el token almacenado.
   */

  const token =
    authService.getToken();


  /**
   * ==========================================================
   * PREPARAR PETICIÓN
   * ==========================================================
   *
   * Si existe un token:
   *
   *     Authorization: Bearer TOKEN
   *
   * Si no existe:
   *
   *     se conserva la petición original.
   *
   * Esto permite que los endpoints públicos funcionen
   * correctamente, por ejemplo:
   *
   *     POST /api/login
   *
   *     POST /api/forgot-password
   *
   *     POST /api/reset-password
   */

  const authenticatedRequest =
    token
      ? request.clone({
          setHeaders: {
            Authorization:
              `Bearer ${token}`
          }
        })
      : request;


  /**
   * ==========================================================
   * ENVIAR PETICIÓN
   * ==========================================================
   */

  return next(
    authenticatedRequest
  ).pipe(

    /**
     * ========================================================
     * MANEJO CENTRALIZADO DE ERRORES
     * ========================================================
     */

    catchError(
      (error: HttpErrorResponse) => {

        /**
         * ====================================================
         * SESIÓN NO AUTORIZADA
         * ====================================================
         *
         * HTTP 401 indica que Laravel rechazó la autenticación.
         *
         * Puede ocurrir cuando:
         *
         *     - el token es inválido;
         *     - el token fue revocado;
         *     - el token fue eliminado;
         *     - la sesión dejó de ser válida.
         *
         * No redirigimos automáticamente cuando el 401 procede
         * del endpoint de login.
         *
         * En ese caso LoginComponent debe recibir el error para
         * mostrar el mensaje correspondiente.
         */

        if (
          error.status === 401 &&
          !request.url.endsWith('/login')
        ) {

          /**
           * ==================================================
           * LIMPIAR SESIÓN COMPLETA
           * ==================================================
           *
           * No utilizamos solamente clearToken().
           *
           * También debemos eliminar de memoria:
           *
           *     - usuario;
           *     - perfiles;
           *     - secciones.
           *
           * De esta manera evitamos conservar autorizaciones
           * pertenecientes a una sesión inválida.
           */

          authService
            .clearAuthenticationState();


          /**
           * ==================================================
           * REDIRIGIR AL LOGIN
           * ==================================================
           *
           * El usuario debe autenticarse nuevamente.
           */

          router.navigate([
            '/login'
          ]);

        }


        /**
         * ====================================================
         * PROPAGAR ERROR
         * ====================================================
         *
         * El interceptor no consume el error.
         *
         * El servicio que realizó la petición todavía puede
         * manejarlo mediante su propio catchError/subscribe.
         */

        return throwError(
          () => error
        );

      }
    )

  );

};