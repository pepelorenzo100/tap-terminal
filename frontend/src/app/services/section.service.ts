/**
 * ============================================================
 * TAP TERMINAL
 * SERVICIO DE SECCIONES
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/services/section.service.ts
 *
 * Responsabilidad:
 *
 *     Consultar las secciones disponibles en Laravel.
 *
 * API:
 *
 *     GET /api/sections
 *
 * Las secciones son dinámicas.
 *
 * Los perfiles no tienen permisos escritos manualmente
 * en Angular. Cada perfil recibe los IDs de las secciones
 * que tenga asignadas.
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


/**
 * ============================================================
 * MODELO DE SECCIÓN
 * ============================================================
 */

export interface Section {

  id: string;

  code: string;

  name: string;

  description: string | null;

  route: string;

  created_at?: string;

  updated_at?: string;
}


/**
 * ============================================================
 * RESPUESTA DEL API
 * ============================================================
 */

export interface SectionsResponse {

  message: string;

  data: Section[];
}


/**
 * ============================================================
 * SERVICIO
 * ============================================================
 */

@Injectable({
  providedIn: 'root'
})
export class SectionService {


  /**
   * ==========================================================
   * URL BASE DE LA API
   * ==========================================================
   */

  private readonly apiUrl =
    'http://127.0.0.1:8000/api';


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
   * LISTAR SECCIONES
   * ==========================================================
   *
   * GET /api/sections
   *
   * El interceptor de autenticación agregará automáticamente
   * el token Bearer.
   */

  getSections(): Observable<SectionsResponse> {

    return this.http
      .get<SectionsResponse>(
        `${this.apiUrl}/sections`
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
  ) {

    let message =
      'No fue posible obtener las secciones.';


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
            'No tienes permiso para consultar las secciones.';

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
      'SectionService error:',
      error
    );


    return throwError(
      () => new Error(message)
    );
  }
}