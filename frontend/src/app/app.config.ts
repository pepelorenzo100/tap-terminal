/**
 * ============================================================
 * TAP TERMINAL
 * CONFIGURACIÓN GLOBAL DE ANGULAR
 * ============================================================
 *
 * Este archivo registra los proveedores globales de la
 * aplicación.
 *
 * Funcionalidades:
 *
 * - Angular Router.
 * - HttpClient.
 * - Interceptor de autenticación.
 * - Detección de cambios.
 *
 * ============================================================
 */

import {
  ApplicationConfig,
  provideZoneChangeDetection
} from '@angular/core';

import {
  provideRouter
} from '@angular/router';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import {
  routes
} from './app.routes';

import {
  authInterceptor
} from './services/auth.interceptor';


/**
 * ============================================================
 * CONFIGURACIÓN PRINCIPAL
 * ============================================================
 */

export const appConfig: ApplicationConfig = {

  providers: [

    /**
     * Configuración de detección de cambios.
     */

    provideZoneChangeDetection({
      eventCoalescing: true
    }),


    /**
     * Angular Router.
     */

    provideRouter(
      routes
    ),


    /**
     * HttpClient + AuthInterceptor.
     *
     * Todas las peticiones HTTP pasarán primero
     * por authInterceptor.
     */

    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    )
  ]
};