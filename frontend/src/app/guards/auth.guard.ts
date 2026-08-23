/**
 * ============================================================
 * TAP TERMINAL
 * GUARD DE AUTENTICACIÓN
 * ============================================================
 *
 * Archivo:
 * auth.guard.ts
 *
 * Responsabilidad:
 *
 * Controlar el acceso a las rutas que requieren
 * autenticación.
 *
 * Flujo:
 *
 * Usuario
 *    ↓
 * Angular Router
 *    ↓
 * AuthGuard
 *    ↓
 * AuthService
 *    ↓
 * ¿Existe token?
 *
 *       Sí
 *       ↓
 *   Permitir acceso
 *
 *       No
 *       ↓
 *    /login
 *
 * ============================================================
 */

import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth.service';


/**
 * ============================================================
 * AUTH GUARD
 * ============================================================
 *
 * CanActivateFn es la implementación funcional de un guard
 * en Angular moderno.
 *
 * Se ejecuta antes de permitir el acceso a una ruta.
 */
export const authGuard: CanActivateFn = () => {

  /**
   * ==========================================================
   * OBTENER SERVICIOS
   * ==========================================================
   *
   * inject() permite obtener servicios desde el sistema
   * de Dependency Injection de Angular.
   */

  const authService = inject(AuthService);

  const router = inject(Router);


  /**
   * ==========================================================
   * COMPROBAR AUTENTICACIÓN
   * ==========================================================
   *
   * AuthService.isAuthenticated() comprueba si existe
   * un token almacenado en localStorage.
   */

  if (authService.isAuthenticated()) {

    /**
     * Existe token.
     *
     * Permitimos continuar hacia la ruta solicitada.
     */

    return true;
  }


  /**
   * ==========================================================
   * USUARIO NO AUTENTICADO
   * ==========================================================
   *
   * No existe token.
   *
   * Por seguridad no permitimos acceder a la ruta protegida.
   *
   * Redirigimos al login.
   */

  return router.createUrlTree(['/login']);
};