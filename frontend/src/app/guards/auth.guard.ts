/**
 * ============================================================
 * TAP TERMINAL
 * AUTH GUARD
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/guards/auth.guard.ts
 *
 * Responsabilidad:
 *
 *     Proteger las rutas privadas de Angular.
 *
 * Flujo:
 *
 *     Usuario
 *         ↓
 *     Intento de navegación
 *         ↓
 *     AuthGuard
 *         ↓
 *     AuthService.getToken()
 *         ↓
 *     ¿Existe token?
 *        /       \
 *      NO         SÍ
 *      ↓          ↓
 *   /login    Permitir ruta
 *
 * IMPORTANTE:
 *
 * Este guard controla únicamente la navegación del frontend.
 *
 * La seguridad real de los endpoints continúa estando
 * en Laravel mediante:
 *
 *     auth:sanctum
 *
 * y los mecanismos de autorización del backend.
 *
 * Por lo tanto:
 *
 *     Angular
 *         → controla navegación y experiencia de usuario.
 *
 *     Laravel
 *         → controla la seguridad real de la API.
 *
 * ============================================================
 */

import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  AuthService
} from '../services/auth.service';


/**
 * ============================================================
 * AUTH GUARD
 * ============================================================
 *
 * Guard funcional de Angular.
 *
 * Comprueba si existe un token de autenticación almacenado
 * mediante AuthService.
 *
 * Comportamiento:
 *
 *     Token existente
 *         ↓
 *     Permite navegación.
 *
 *     Sin token
 *         ↓
 *     Redirige a /login.
 *
 * Además, conserva la URL solicitada mediante:
 *
 *     returnUrl
 *
 * Esto permite que el flujo de autenticación pueda conocer
 * posteriormente qué ruta intentaba abrir el usuario.
 *
 * ============================================================
 */

export const authGuard: CanActivateFn = (
  _route,
  state
) => {

  /**
   * ==========================================================
   * INYECTAR SERVICIOS
   * ==========================================================
   *
   * Los guards funcionales utilizan inject() para obtener
   * las dependencias necesarias.
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
   * AuthService centraliza el acceso al token.
   *
   * No duplicamos aquí la lógica de localStorage.
   */

  const token =
    authService.getToken();


  /**
   * ==========================================================
   * USUARIO AUTENTICADO
   * ==========================================================
   *
   * Si existe un token, permitimos continuar.
   *
   * IMPORTANTE:
   *
   * La existencia del token no garantiza por sí sola que
   * la sesión siga siendo válida.
   *
   * Laravel realizará la validación definitiva cuando
   * se consulte un endpoint protegido.
   */

  if (
    token
  ) {

    return true;

  }


  /**
   * ==========================================================
   * USUARIO NO AUTENTICADO
   * ==========================================================
   *
   * Si no existe token:
   *
   *     1. Bloqueamos la navegación.
   *     2. Redirigimos al login.
   *     3. Conservamos la URL solicitada.
   *
   * Ejemplo:
   *
   *     /profiles
   *
   * se convierte en:
   *
   *     /login?returnUrl=%2Fprofiles
   *
   */

  return router.createUrlTree(
    ['/login'],
    {
      queryParams: {
        returnUrl:
          state.url
      }
    }
  );

};