/**
 * Configuración global de la aplicación Angular.
 *
 * Este archivo centraliza los proveedores (providers)
 * que estarán disponibles para toda la aplicación.
 *
 * Aquí configuramos principalmente:
 *
 * - El sistema de detección de cambios de Angular.
 * - El sistema de navegación mediante Angular Router.
 * - El cliente HTTP utilizado para comunicarnos con Laravel.
 */

import {
  ApplicationConfig,
  provideZoneChangeDetection
} from '@angular/core';

/**
 * provideRouter registra el sistema de rutas de Angular.
 *
 * Esto permite que la aplicación pueda determinar
 * qué componente debe mostrarse dependiendo de la URL.
 */
import { provideRouter } from '@angular/router';

/**
 * provideHttpClient registra HttpClient dentro del sistema
 * de Dependency Injection de Angular.
 *
 * ProductService necesita HttpClient para realizar
 * las peticiones HTTP hacia nuestra API REST de Laravel.
 */
import { provideHttpClient } from '@angular/common/http';

/**
 * Importamos la configuración de rutas de nuestra aplicación.
 *
 * El archivo app.routes.ts contiene la definición de
 * las rutas que utilizará Angular.
 */
import { routes } from './app.routes';

/**
 * Configuración principal de la aplicación.
 *
 * ApplicationConfig permite registrar los proveedores
 * que estarán disponibles globalmente.
 */
export const appConfig: ApplicationConfig = {

  /**
   * providers contiene los servicios y funcionalidades
   * que Angular podrá utilizar en toda la aplicación.
   */
  providers: [

    /**
     * Configura la detección de cambios basada en Zone.js.
     *
     * eventCoalescing: true permite agrupar determinados
     * eventos para reducir ejecuciones innecesarias
     * de detección de cambios.
     *
     * Esto puede ayudar a mejorar el rendimiento
     * de la aplicación.
     */
    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    /**
     * Registra Angular Router utilizando las rutas
     * definidas en app.routes.ts.
     *
     * Gracias a este proveedor podremos navegar
     * entre diferentes vistas de la aplicación.
     */
    provideRouter(routes),

    /**
     * Registra HttpClient globalmente.
     *
     * Esto es necesario porque ProductService utiliza
     * HttpClient para comunicarse con la API REST de Laravel.
     *
     * Sin este proveedor, Angular no podría inyectar
     * HttpClient dentro de ProductService.
     */
    provideHttpClient()
  ]
};