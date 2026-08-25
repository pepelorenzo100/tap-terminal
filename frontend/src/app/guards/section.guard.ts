/**
 * ============================================================
 * TAP TERMINAL
 * SECTION GUARD
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/guards/section.guard.ts
 *
 * Responsabilidad:
 *
 *     Controlar el acceso del usuario autenticado a las
 *     secciones administrativas de la aplicación.
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
  catchError,
  map,
  of
} from 'rxjs';

import {
  AuthService
} from '../services/auth.service';


/**
 * ============================================================
 * SECTION GUARD
 * ============================================================
 */

export const sectionGuard: CanActivateFn = (
  route
) => {

  /**
   * ==========================================================
   * INYECTAR SERVICIOS
   * ==========================================================
   */

  const authService =
    inject(AuthService);

  const router =
    inject(Router);


  /**
   * ==========================================================
   * OBTENER SECCIÓN REQUERIDA
   * ==========================================================
   */

  const requiredSection =
    String(
      route.data?.['sectionCode'] ?? ''
    ).trim();


  /**
   * ==========================================================
   * RUTA SIN SECCIÓN
   * ==========================================================
   */

  if (
    !requiredSection
  ) {

    return true;

  }


  /**
   * ==========================================================
   * COMPROBAR SECCIONES EN MEMORIA
   * ==========================================================
   */

  const currentSections =
    authService.getSections();


  /**
   * ==========================================================
   * DEBUG
   * ==========================================================
   *
   * Esto nos permite comprobar exactamente qué está viendo
   * el SectionGuard.
   */

  console.log(
    'SECTION GUARD:',
    {
      requiredSection,
      currentSections
    }
  );


  /**
   * ==========================================================
   * SI YA EXISTEN SECCIONES EN MEMORIA
   * ==========================================================
   */

  if (
    currentSections.length > 0
  ) {

    /**
     * --------------------------------------------------------
     * COMPROBAR PERMISO
     * --------------------------------------------------------
     */

    const hasPermission =
      hasRequiredSection(
        currentSections,
        requiredSection
      );


    console.log(
      'SECTION GUARD PERMISSION:',
      {
        requiredSection,
        hasPermission
      }
    );


    /**
     * --------------------------------------------------------
     * PERMITIR
     * --------------------------------------------------------
     */

    if (
      hasPermission
    ) {

      return true;

    }


    /**
     * --------------------------------------------------------
     * DENEGAR
     * --------------------------------------------------------
     *
     * El usuario está autenticado pero no posee la sección.
     */

    return router.createUrlTree([
      '/'
    ]);

  }


  /**
   * ==========================================================
   * COMPROBAR TOKEN
   * ==========================================================
   */

  if (
    !authService.getToken()
  ) {

    return router.createUrlTree([
      '/login'
    ]);

  }


  /**
   * ==========================================================
   * RECUPERAR AUTORIZACIÓN
   * ==========================================================
   *
   * Si existe token pero todavía no tenemos las secciones,
   * consultamos /api/me.
   */

  return authService
    .me()
    .pipe(

      /**
       * ======================================================
       * RESPUESTA CORRECTA
       * ======================================================
       */

      map(
        () => {

          /**
           * --------------------------------------------------
           * OBTENER SECCIONES ACTUALIZADAS
           * --------------------------------------------------
           */

          const sections =
            authService.getSections();


          /**
           * --------------------------------------------------
           * DEBUG DESPUÉS DE /api/me
           * --------------------------------------------------
           */

          console.log(
            'SECTION GUARD DESPUÉS DE /api/me:',
            sections
          );


          /**
           * --------------------------------------------------
           * COMPROBAR PERMISO
           * --------------------------------------------------
           */

          const hasPermission =
            hasRequiredSection(
              sections,
              requiredSection
            );


          /**
           * --------------------------------------------------
           * DEBUG DEL PERMISO
           * --------------------------------------------------
           */

          console.log(
            'SECTION GUARD PERMISSION DESPUÉS DE /api/me:',
            {
              requiredSection,
              hasPermission,
              sections
            }
          );


          /**
           * --------------------------------------------------
           * PERMITIR
           * --------------------------------------------------
           */

          if (
            hasPermission
          ) {

            return true;

          }


          /**
           * --------------------------------------------------
           * DENEGAR
           * --------------------------------------------------
           */

          return router.createUrlTree([
            '/'
          ]);

        }
      ),


      /**
       * ======================================================
       * ERROR AL RECUPERAR /api/me
       * ======================================================
       */

      catchError(
        (error: unknown) => {

          console.error(
            'ERROR SECTION GUARD /api/me:',
            error
          );


          /**
           * --------------------------------------------------
           * LIMPIAR ESTADO LOCAL
           * --------------------------------------------------
           */

          authService
            .clearAuthenticationState();


          /**
           * --------------------------------------------------
           * REGRESAR AL LOGIN
           * --------------------------------------------------
           */

          return of(
            router.createUrlTree([
              '/login'
            ])
          );

        }
      )

    );

};


/**
 * ============================================================
 * COMPROBAR SECCIÓN
 * ============================================================
 */

function hasRequiredSection(
  sections: ReturnType<
    AuthService['getSections']
  >,
  requiredSection: string
): boolean {

  /**
   * ==========================================================
   * NORMALIZAR SECCIÓN REQUERIDA
   * ==========================================================
   */

  const normalizedRequiredSection =
    requiredSection
      .trim()
      .toUpperCase();


  /**
   * ==========================================================
   * BUSCAR COINCIDENCIA
   * ==========================================================
   */

  return sections.some(
    (section) => {

      const sectionCode =
        String(
          section.code ?? ''
        )
          .trim()
          .toUpperCase();


      return (
        sectionCode ===
        normalizedRequiredSection
      );

    }
  );

}