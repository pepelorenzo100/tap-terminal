/**
 * Punto de entrada principal de la aplicación Angular.
 *
 * Este archivo es el encargado de iniciar la aplicación
 * y asociarla con el componente raíz AppComponent.
 *
 * También se importa appConfig para aplicar la configuración
 * global definida en:
 *
 * src/app/app.config.ts
 *
 * El flujo de inicio es:
 *
 * main.ts
 *    ↓
 * bootstrapApplication()
 *    ↓
 * AppComponent
 *    ↓
 * appConfig
 *    ↓
 * Router + HttpClient + configuración de Angular
 */

/**
 * bootstrapApplication permite iniciar una aplicación Angular
 * utilizando la arquitectura moderna basada en componentes
 * standalone.
 */
import { bootstrapApplication } from '@angular/platform-browser';

/**
 * AppComponent es el componente raíz de nuestra aplicación.
 *
 * Es el primer componente que Angular carga al iniciar
 * el frontend.
 */
import { AppComponent } from './app/app.component';

/**
 * appConfig contiene la configuración global de Angular.
 *
 * Dentro de esta configuración tenemos, entre otros:
 *
 * - Angular Router.
 * - HttpClient.
 * - Detección de cambios.
 *
 * Esto permite que las funcionalidades configuradas
 * estén disponibles durante la ejecución de la aplicación.
 */
import { appConfig } from './app/app.config';

/**
 * Inicia la aplicación Angular.
 *
 * bootstrapApplication recibe:
 *
 * 1. AppComponent:
 *    Componente raíz que Angular debe renderizar.
 *
 * 2. appConfig:
 *    Configuración global que utilizará la aplicación.
 *
 * La función devuelve una Promise porque el proceso
 * de inicialización puede realizarse de forma asíncrona.
 *
 * Si ocurre un error durante el arranque, catch()
 * permite mostrarlo en la consola del navegador.
 */
bootstrapApplication(AppComponent, appConfig)
  .catch((error) => console.error(error));