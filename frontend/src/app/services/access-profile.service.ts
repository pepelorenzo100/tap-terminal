/**
 * ============================================================
 * TAP TERMINAL
 * SERVICIO DE PERFILES DE AUTORIZACIÓN
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/services/access-profile.service.ts
 *
 * Responsabilidad:
 *
 * Centralizar la comunicación entre Angular y Laravel para
 * administrar los perfiles de autorización.
 *
 * API:
 *
 *     GET    /api/access-profiles
 *     POST   /api/access-profiles
 *     GET    /api/access-profiles/{id}
 *     PUT    /api/access-profiles/{id}
 *     DELETE /api/access-profiles/{id}
 *
 * IMPORTANTE:
 *
 * El AuthInterceptor agrega automáticamente:
 *
 *     Authorization: Bearer TOKEN
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
  AccessProfile,
  Section
} from '../models/auth';


/**
 * ============================================================
 * RESPUESTAS DEL API
 * ============================================================
 */

export interface AccessProfilesResponse {

  message: string;

  data: AccessProfile[];
}


export interface AccessProfileResponse {

  message: string;

  data: AccessProfile;

  sections?: Section[];
}


/**
 * ============================================================
 * DATOS PARA CREAR / ACTUALIZAR
 * ============================================================
 */

export interface AccessProfilePayload {

  name: string;

  description: string | null;

  section_ids: string[];
}


/**
 * ============================================================
 * SERVICIO
 * ============================================================
 */

@Injectable({
  providedIn: 'root'
})
export class AccessProfileService {

  /**
   * ==========================================================
   * URL BASE
   * ==========================================================
   */

  private readonly apiUrl =
    'http://127.0.0.1:8000/api/access-profiles';


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
   * LISTAR PERFILES
   * ==========================================================
   *
   * GET /api/access-profiles
   */

  getAll(): Observable<AccessProfilesResponse> {

    return this.http
      .get<AccessProfilesResponse>(
        this.apiUrl
      )
      .pipe(
        catchError(
          this.handleError
        )
      );
  }


  /**
   * ==========================================================
   * OBTENER PERFIL
   * ==========================================================
   *
   * GET /api/access-profiles/{id}
   */

  getById(
    id: string
  ): Observable<AccessProfileResponse> {

    return this.http
      .get<AccessProfileResponse>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        catchError(
          this.handleError
        )
      );
  }


  /**
   * ==========================================================
   * CREAR PERFIL
   * ==========================================================
   *
   * POST /api/access-profiles
   *
   * El código NO se envía.
   *
   * Laravel lo genera automáticamente.
   */

  create(
    payload: AccessProfilePayload
  ): Observable<AccessProfileResponse> {

    return this.http
      .post<AccessProfileResponse>(
        this.apiUrl,
        payload
      )
      .pipe(
        catchError(
          this.handleError
        )
      );
  }


  /**
   * ==========================================================
   * ACTUALIZAR PERFIL
   * ==========================================================
   *
   * PUT /api/access-profiles/{id}
   */

  update(
    id: string,
    payload: AccessProfilePayload
  ): Observable<AccessProfileResponse> {

    return this.http
      .put<AccessProfileResponse>(
        `${this.apiUrl}/${id}`,
        payload
      )
      .pipe(
        catchError(
          this.handleError
        )
      );
  }


  /**
   * ==========================================================
   * ELIMINAR PERFIL
   * ==========================================================
   *
   * DELETE /api/access-profiles/{id}
   */

  delete(
    id: string
  ): Observable<{ message: string }> {

    return this.http
      .delete<{ message: string }>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        catchError(
          this.handleError
        )
      );
  }


  /**
   * ==========================================================
   * MANEJO DE ERRORES
   * ==========================================================
   */

  private handleError(
    error: HttpErrorResponse
  ): Observable<never> {

    let message =
      'Ocurrió un error al comunicarse con el servidor.';


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


        case 403:

          message =
            'No tienes permisos para administrar perfiles.';

          break;


        case 404:

          message =
            'El perfil solicitado no existe.';

          break;


        case 422:

          message =
            error.error?.message ??
            'Los datos enviados no son válidos.';

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
      'AccessProfileService error:',
      error
    );


    return throwError(
      () => new Error(message)
    );
  }

}