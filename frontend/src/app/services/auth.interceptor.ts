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
 * Agregar automáticamente el token Bearer de Sanctum
 * a las peticiones HTTP que requieren autenticación.
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
 * ============================================================
 */

import {
  HttpInterceptorFn
} from '@angular/common/http';


/**
 * ============================================================
 * INTERCEPTOR
 * ============================================================
 *
 * Los interceptores funcionales permiten modificar una
 * petición HTTP antes de enviarla al servidor.
 */

export const authInterceptor: HttpInterceptorFn = (
  request,
  next
) => {

  /**
   * ==========================================================
   * OBTENER TOKEN
   * ==========================================================
   */

  const token = localStorage.getItem(
    'tap_terminal_auth_token'
  );


  /**
   * Si no existe token, enviamos la petición original.
   *
   * Esto es necesario para operaciones públicas como:
   *
   * POST /api/login
   */

  if (!token) {
    return next(request);
  }


  /**
   * ==========================================================
   * AGREGAR AUTHORIZATION
   * ==========================================================
   *
   * HttpRequest es inmutable.
   *
   * Por eso utilizamos clone() para crear una copia
   * con el nuevo encabezado.
   */

  const authenticatedRequest =
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });


  /**
   * Enviamos la petición modificada.
   */

  return next(
    authenticatedRequest
  );
};