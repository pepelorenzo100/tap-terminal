/**
 * ============================================================
 * TAP TERMINAL
 * SERVICIO DE AUTENTICACIÓN
 * ============================================================
 *
 * Archivo:
 * auth.service.ts
 *
 * Responsabilidad:
 *
 * Centralizar la comunicación entre Angular y los endpoints
 * de autenticación de Laravel.
 *
 * Operaciones:
 *
 * - Login
 * - Logout
 * - Obtener usuario autenticado
 * - Obtener token
 * - Comprobar autenticación
 *
 * Arquitectura:
 *
 * Component
 *     ↓
 * AuthService
 *     ↓
 * HttpClient
 *     ↓
 * Laravel AuthController
 *     ↓
 * Sanctum
 *     ↓
 * MongoDB
 *
 * ============================================================
 */

import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import {
  Observable,
  catchError,
  throwError
} from 'rxjs';

import {
  AuthResponse,
  AuthUser,
  LogoutResponse,
  MeResponse
} from '../models/auth';


/**
 * ============================================================
 * SERVICIO
 * ============================================================
 *
 * providedIn: 'root'
 *
 * Angular crea una única instancia del servicio para toda
 * la aplicación.
 */

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * ==========================================================
   * URL BASE DE AUTENTICACIÓN
   * ==========================================================
   *
   * Backend:
   *
   * http://127.0.0.1:8000
   *
   * Endpoints:
   *
   * POST /api/login
   * POST /api/logout
   * GET  /api/me
   */

  private readonly apiUrl =
    'http://127.0.0.1:8000/api';


  /**
   * Clave utilizada para guardar el token en el navegador.
   *
   * Mantener la clave centralizada evita escribirla
   * directamente en diferentes partes de la aplicación.
   */

  private readonly tokenKey =
    'tap_terminal_auth_token';


  /**
   * ==========================================================
   * CONSTRUCTOR
   * ==========================================================
   */

  constructor(
    private readonly http: HttpClient
  ) {}


  /**
   * ==========================================================
   * LOGIN
   * ==========================================================
   *
   * POST /api/login
   *
   * Envía:
   *
   * {
   *   email,
   *   password,
   *   device_name
   * }
   *
   * Laravel devuelve un token Bearer.
   */

  login(
    email: string,
    password: string,
    deviceName = 'TAP Terminal Web'
  ): Observable<AuthResponse> {

    const data = {
      email: email.trim(),
      password,
      device_name: deviceName
    };

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/login`,
        data
      )
      .pipe(
        catchError(this.handleError)
      );
  }


  /**
   * ==========================================================
   * GUARDAR TOKEN
   * ==========================================================
   *
   * Guarda el token recibido de Laravel.
   *
   * El token posteriormente será utilizado por el
   * AuthInterceptor para construir:
   *
   * Authorization: Bearer TOKEN
   */

  setToken(token: string): void {
    localStorage.setItem(
      this.tokenKey,
      token
    );
  }


  /**
   * ==========================================================
   * OBTENER TOKEN
   * ==========================================================
   */

  getToken(): string | null {
    return localStorage.getItem(
      this.tokenKey
    );
  }


  /**
   * ==========================================================
   * ELIMINAR TOKEN
   * ==========================================================
   */

  clearToken(): void {
    localStorage.removeItem(
      this.tokenKey
    );
  }


  /**
   * ==========================================================
   * COMPROBAR AUTENTICACIÓN
   * ==========================================================
   *
   * Esta comprobación solamente indica si Angular tiene
   * un token almacenado.
   *
   * La validez real del token la determina Laravel Sanctum.
   */

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }


  /**
   * ==========================================================
   * USUARIO AUTENTICADO
   * ==========================================================
   *
   * GET /api/me
   *
   * Requiere:
   *
   * Authorization: Bearer TOKEN
   *
   * El interceptor será responsable de agregar
   * automáticamente este encabezado.
   */

  me(): Observable<MeResponse> {

    return this.http
      .get<MeResponse>(
        `${this.apiUrl}/me`
      )
      .pipe(
        catchError(this.handleError)
      );
  }


  /**
   * ==========================================================
   * LOGOUT
   * ==========================================================
   *
   * POST /api/logout
   *
   * Laravel revoca el token actual.
   *
   * Solamente eliminamos el token local después de que
   * el backend confirme correctamente el cierre de sesión.
   */

  logout(): Observable<LogoutResponse> {

    return this.http
      .post<LogoutResponse>(
        `${this.apiUrl}/logout`,
        {}
      )
      .pipe(
        catchError(this.handleError)
      );
  }


  /**
   * ==========================================================
   * MANEJO DE ERRORES
   * ==========================================================
   *
   * Centralizamos los errores para no repetir la misma
   * lógica en cada método HTTP.
   */

  private handleError(
    error: HttpErrorResponse
  ) {

    let message =
      'Ocurrió un error al comunicarse con el servidor.';


    /**
     * Error de conexión.
     */

    if (error.status === 0) {

      message =
        'No fue posible conectarse con Laravel. ' +
        'Verifica que el backend esté ejecutándose en ' +
        'http://127.0.0.1:8000';

    } else {

      switch (error.status) {

        case 401:

          message =
            'La sesión no es válida o ha expirado.';

          break;

        case 422:

          message =
            'Los datos de autenticación no son válidos.';

          break;

        case 500:

          message =
            'Error interno del servidor Laravel.';

          break;

        default:

          message =
            `Error HTTP ${error.status}: ${error.message}`;

          break;
      }
    }


    console.error(
      'AuthService error:',
      error
    );


    return throwError(
      () => new Error(message)
    );
  }
}