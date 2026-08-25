/**
 * ============================================================
 * TAP TERMINAL
 * SERVICIO DE AUTENTICACIÓN Y AUTORIZACIÓN
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/services/auth.service.ts
 *
 * Responsabilidad:
 *
 * Centralizar toda la comunicación de autenticación entre
 * Angular y Laravel.
 *
 * ============================================================
 */

import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import {
  BehaviorSubject,
  catchError,
  Observable,
  tap,
  throwError
} from 'rxjs';

import {
  AccessProfile,
  AuthResponse,
  AuthUser,
  LogoutResponse,
  MeResponse,
  Section
} from '../models/auth';


/**
 * ============================================================
 * RESPUESTA DE RECUPERACIÓN / RESTABLECIMIENTO
 * ============================================================
 */

export interface PasswordResetResponse {

  message: string;

}


/**
 * ============================================================
 * SERVICIO
 * ============================================================
 */

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  /**
   * ==========================================================
   * URL BASE DE LA API
   * ==========================================================
   */

  private readonly apiUrl =
    'http://127.0.0.1:8000/api';


  /**
   * ==========================================================
   * CLAVE DEL TOKEN
   * ==========================================================
   */

  private readonly tokenKey =
    'tap_terminal_auth_token';


  /**
   * ==========================================================
   * ESTADO DEL USUARIO
   * ==========================================================
   */

  private readonly userSubject =
    new BehaviorSubject<AuthUser | null>(null);


  /**
   * ==========================================================
   * ESTADO DE PERFILES
   * ==========================================================
   */

  private readonly profilesSubject =
    new BehaviorSubject<AccessProfile[]>([]);


  /**
   * ==========================================================
   * ESTADO DE SECCIONES
   * ==========================================================
   */

  private readonly sectionsSubject =
    new BehaviorSubject<Section[]>([]);


  /**
   * ==========================================================
   * OBSERVABLES PÚBLICOS
   * ==========================================================
   */

  readonly user$ =
    this.userSubject.asObservable();


  readonly accessProfiles$ =
    this.profilesSubject.asObservable();


  readonly sections$ =
    this.sectionsSubject.asObservable();


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
   * INICIO DE SESIÓN
   * ==========================================================
   *
   * POST /api/login
   */

  login(
    email: string,
    password: string,
    deviceName = 'TAP Terminal Web'
  ): Observable<AuthResponse> {

    const data = {

      email:
        email.trim(),

      password,

      device_name:
        deviceName

    };


    console.log(
      'AUTH SERVICE LOGIN:',
      {
        email: data.email
      }
    );


    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/login`,
        data
      )
      .pipe(

        tap(
          (response) => {

            console.log(
              'AUTH SERVICE LOGIN RESPONSE:',
              response
            );


            this.setToken(
              response.data.token
            );

          }
        ),

        catchError(
          this.handleError
        )

      );

  }


  /**
   * ==========================================================
   * SOLICITAR RECUPERACIÓN DE CONTRASEÑA
   * ==========================================================
   *
   * POST /api/forgot-password
   */

  forgotPassword(
    email: string
  ): Observable<PasswordResetResponse> {

    const data = {

      email:
        email.trim().toLowerCase()

    };


    return this.http
      .post<PasswordResetResponse>(
        `${this.apiUrl}/forgot-password`,
        data
      )
      .pipe(

        catchError(
          this.handleError
        )

      );

  }


  /**
   * ==========================================================
   * RESTABLECER CONTRASEÑA
   * ==========================================================
   *
   * POST /api/reset-password
   */

  resetPassword(
    email: string,
    token: string,
    password: string,
    passwordConfirmation: string
  ): Observable<PasswordResetResponse> {

    const data = {

      email:
        email.trim().toLowerCase(),

      token,

      password,

      password_confirmation:
        passwordConfirmation

    };


    return this.http
      .post<PasswordResetResponse>(
        `${this.apiUrl}/reset-password`,
        data
      )
      .pipe(

        catchError(
          this.handleError
        )

      );

  }


  /**
   * ==========================================================
   * GUARDAR TOKEN
   * ==========================================================
   */

  setToken(
    token: string
  ): void {

    localStorage.setItem(
      this.tokenKey,
      token
    );


    console.log(
      'AUTH SERVICE: token guardado'
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


    console.log(
      'AUTH SERVICE: token eliminado'
    );

  }


  /**
   * ==========================================================
   * COMPROBAR AUTENTICACIÓN
   * ==========================================================
   */

  isAuthenticated(): boolean {

    return this.getToken() !== null;

  }


  /**
   * ==========================================================
   * OBTENER USUARIO Y AUTORIZACIÓN
   * ==========================================================
   *
   * GET /api/me
   *
   * Laravel devuelve:
   *
   *     {
   *       message: "...",
   *       data: {
   *         user: {...},
   *         access_profiles: [...],
   *         sections: [...]
   *       }
   *     }
   *
   * Aquí actualizamos:
   *
   *     userSubject
   *     profilesSubject
   *     sectionsSubject
   */

  me(): Observable<MeResponse> {

    console.log(
      'AUTH SERVICE: solicitando /api/me'
    );


    return this.http
      .get<MeResponse>(
        `${this.apiUrl}/me`
      )
      .pipe(

        tap(
          (response) => {

            /**
             * ==================================================
             * DEBUG COMPLETO
             * ==================================================
             */

            console.log(
              '=================================================='
            );

            console.log(
              'AUTH SERVICE /api/me RESPONSE:',
              response
            );


            console.log(
              'AUTH SERVICE /api/me DATA:',
              response.data
            );


            console.log(
              'AUTH SERVICE USER:',
              response.data?.user
            );


            console.log(
              'AUTH SERVICE ACCESS PROFILES:',
              response.data?.access_profiles
            );


            console.log(
              'AUTH SERVICE SECTIONS:',
              response.data?.sections
            );


            /**
             * ==================================================
             * USUARIO
             * ==================================================
             */

            this.userSubject.next(
              response.data.user
            );


            /**
             * ==================================================
             * PERFILES
             * ==================================================
             */

            const accessProfiles =
              response.data.access_profiles ?? [];


            this.profilesSubject.next(
              accessProfiles
            );


            /**
             * ==================================================
             * SECCIONES
             * ==================================================
             *
             * IMPORTANTE:
             *
             * Aquí esperamos recibir:
             *
             *     response.data.sections
             *
             * con:
             *
             *     SEC-DASHBOARD
             *     SEC-PRODUCTS
             *     SEC-USERS
             *     SEC-PROFILES
             */

            const sections =
              response.data.sections ?? [];


            console.log(
              'AUTH SERVICE SECTIONS ANTES DE NEXT:',
              sections
            );


            this.sectionsSubject.next(
              sections
            );


            /**
             * ==================================================
             * VERIFICAR ESTADO DESPUÉS DE NEXT()
             * ==================================================
             */

            console.log(
              'AUTH SERVICE USER DESPUÉS DE NEXT:',
              this.getCurrentUser()
            );


            console.log(
              'AUTH SERVICE PROFILES DESPUÉS DE NEXT:',
              this.getAccessProfiles()
            );


            console.log(
              'AUTH SERVICE SECTIONS DESPUÉS DE NEXT:',
              this.getSections()
            );


            console.log(
              'AUTH SERVICE SECTIONS LENGTH:',
              this.getSections().length
            );


            console.log(
              '=================================================='
            );

          }
        ),

        catchError(
          this.handleError
        )

      );

  }


  /**
   * ==========================================================
   * OBTENER USUARIO ACTUAL
   * ==========================================================
   */

  getCurrentUser(): AuthUser | null {

    return this.userSubject.value;

  }


  /**
   * ==========================================================
   * OBTENER PERFILES ACTUALES
   * ==========================================================
   */

  getAccessProfiles(): AccessProfile[] {

    return this.profilesSubject.value;

  }


  /**
   * ==========================================================
   * OBTENER SECCIONES ACTUALES
   * ==========================================================
   */

  getSections(): Section[] {

    return this.sectionsSubject.value;

  }


  /**
   * ==========================================================
   * COMPROBAR SECCIÓN
   * ==========================================================
   *
   * Ejemplo:
   *
   *     hasSection('SEC-PROFILES')
   */

  hasSection(
    sectionCode: string
  ): boolean {

    const normalizedCode =
      sectionCode
        .trim()
        .toUpperCase();


    return this.sectionsSubject.value.some(
      section => {

        const currentCode =
          String(
            section.code ?? ''
          )
            .trim()
            .toUpperCase();


        return (
          currentCode ===
          normalizedCode
        );

      }
    );

  }


  /**
   * ==========================================================
   * COMPROBAR RUTA
   * ==========================================================
   */

  hasRoute(
    route: string
  ): boolean {

    return this.sectionsSubject.value.some(
      section =>
        section.route === route
    );

  }


  /**
   * ==========================================================
   * COMPROBAR PERFIL DE AUTORIZACIÓN
   * ==========================================================
   */

  hasProfile(
    profileCode: string
  ): boolean {

    const normalizedCode =
      profileCode
        .trim()
        .toUpperCase();


    return this.profilesSubject.value.some(
      profile => {

        const currentCode =
          String(
            profile.code ?? ''
          )
            .trim()
            .toUpperCase();


        return (
          currentCode ===
          normalizedCode
        );

      }
    );

  }


  /**
   * ==========================================================
   * CERRAR SESIÓN
   * ==========================================================
   *
   * POST /api/logout
   */

  logout(): Observable<LogoutResponse> {

    return this.http
      .post<LogoutResponse>(
        `${this.apiUrl}/logout`,
        {}
      )
      .pipe(

        tap(
          () => {

            this.clearAuthenticationState();

          }
        ),

        catchError(
          this.handleError
        )

      );

  }


  /**
   * ==========================================================
   * LIMPIAR ESTADO DE AUTENTICACIÓN
   * ==========================================================
   */

  clearAuthenticationState(): void {

    console.log(
      'AUTH SERVICE: limpiando estado de autenticación'
    );


    this.clearToken();


    this.userSubject.next(
      null
    );


    this.profilesSubject.next(
      []
    );


    this.sectionsSubject.next(
      []
    );

  }


  /**
   * ==========================================================
   * MANEJO CENTRALIZADO DE ERRORES
   * ==========================================================
   */

  private handleError(
    error: HttpErrorResponse
  ) {

    let message =
      'Ocurrió un error al comunicarse con el servidor.';


    /**
     * ========================================================
     * SIN CONEXIÓN
     * ========================================================
     */

    if (
      error.status === 0
    ) {

      message =
        'No fue posible conectarse con Laravel. ' +
        'Verifica que el backend esté ejecutándose en ' +
        'http://127.0.0.1:8000';

    }


    /**
     * ========================================================
     * ERRORES HTTP
     * ========================================================
     */

    else {

      switch (
        error.status
      ) {

        /**
         * ----------------------------------------------------
         * 401
         * ----------------------------------------------------
         */

        case 401:

          message =
            'La sesión no es válida o ha expirado.';

          break;


        /**
         * ----------------------------------------------------
         * 403
         * ----------------------------------------------------
         */

        case 403:

          message =
            'No tienes autorización para realizar esta operación.';

          break;


        /**
         * ----------------------------------------------------
         * 422
         * ----------------------------------------------------
         */

        case 422:

          message =
            error.error?.message ||
            'Los datos proporcionados no son válidos.';

          break;


        /**
         * ----------------------------------------------------
         * 404
         * ----------------------------------------------------
         */

        case 404:

          message =
            'El recurso solicitado no fue encontrado.';

          break;


        /**
         * ----------------------------------------------------
         * 500
         * ----------------------------------------------------
         */

        case 500:

          message =
            'Error interno del servidor Laravel.';

          break;


        /**
         * ----------------------------------------------------
         * OTROS
         * ----------------------------------------------------
         */

        default:

          message =
            `Error HTTP ${error.status}: ${error.message}`;

          break;

      }

    }


    /**
     * ========================================================
     * REGISTRO TÉCNICO
     * ========================================================
     */

    console.error(
      'AuthService error:',
      error
    );


    return throwError(
      () =>
        new Error(
          message
        )
    );

  }

}