/**
 * ============================================================
 * TAP TERMINAL
 * INTERCEPTOR DE AUTENTICACIÓN
 * ============================================================
 *
 * Archivo:
 * auth.interceptor.ts
 *
 * Responsabilidad:
 *
 * 1. Agregar automáticamente el token Bearer de Sanctum.
 * 2. Detectar respuestas HTTP 401.
 * 3. Eliminar el token cuando la sesión ya no es válida.
 * 4. Redirigir al usuario al login.
 *
 * Flujo:
 *
 * Angular
 *    ↓
 * HttpClient
 *    ↓
 * AuthInterceptor
 *    ↓
 * Authorization: Bearer TOKEN
 *    ↓
 * Laravel Sanctum
 *
 * Si Laravel responde 401:
 *
 * 401 Unauthorized
 *    ↓
 * clearToken()
 *    ↓
 * /login
 *
 * ============================================================
 */

import { inject } from '@angular/core';

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
 * INTERCEPTOR
 * ============================================================
 *
 * Interceptor funcional de Angular.
 *
 * Se ejecuta automáticamente antes de enviar
 * las peticiones HTTP realizadas mediante HttpClient.
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

  const authService = inject(
    AuthService
  );

  const router = inject(
    Router
  );


  /**
   * ==========================================================
   * OBTENER TOKEN
   * ==========================================================
   */

  const token = authService.getToken();


  /**
   * ==========================================================
   * CREAR PETICIÓN AUTENTICADA
   * ==========================================================
   *
   * Si existe token agregamos:
   *
   * Authorization: Bearer TOKEN
   *
   * Si no existe token enviamos la petición original.
   *
   * Esto permite realizar operaciones públicas como:
   *
   * POST /api/login
   */

  const authenticatedRequest = token

    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
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
     * MANEJO DE ERRORES HTTP
     * ========================================================
     */

    catchError(
      (error: HttpErrorResponse) => {

        /**
         * ====================================================
         * SESIÓN NO AUTORIZADA
         * ====================================================
         *
         * HTTP 401 significa que Laravel no acepta
         * las credenciales/token enviados.
         *
         * Ejemplos:
         *
         * - Token expirado.
         * - Token revocado.
         * - Token eliminado.
         * - Token inválido.
         *
         * IMPORTANTE:
         *
         * No hacemos redirect si el error 401 viene
         * específicamente del endpoint de login.
         *
         * De esta manera el LoginComponent puede mostrar
         * correctamente el mensaje de autenticación.
         */

        if (
          error.status === 401 &&
          !request.url.endsWith('/login')
        ) {

          /**
           * ==================================================
           * ELIMINAR TOKEN LOCAL
           * ==================================================
           *
           * La sesión local deja de considerarse válida.
           */

          authService.clearToken();


          /**
           * ==================================================
           * REDIRIGIR AL LOGIN
           * ==================================================
           */

          router.navigate(
            ['/login']
          );

        }


        /**
         * ==================================================
         * PROPAGAR ERROR
         * ==================================================
         *
         * No ocultamos el error.
         *
         * El servicio/componente que realizó la petición
         * todavía puede manejarlo.
         */

        return throwError(
          () => error
        );

      }
    )

  );

};