/**
 * ============================================================
 * TAP TERMINAL
 * DASHBOARD COMPONENT
 * ============================================================
 *
 * Componente principal del sistema.
 *
 * Responsabilidad:
 *
 * - Mostrar la pantalla de inicio.
 * - Servir como punto de entrada después del login.
 * - Proporcionar accesos directos a Productos y Usuarios.
 *
 * Este componente NO contiene lógica de negocio.
 *
 * La navegación se realiza mediante Angular Router.
 * ============================================================
 */

import { Component } from '@angular/core';

import {
  RouterLink
} from '@angular/router';


/**
 * ============================================================
 * DASHBOARD COMPONENT
 * ============================================================
 */

@Component({

  /**
   * Selector utilizado cuando otro componente necesita
   * representar este componente.
   */
  selector: 'app-dashboard',

  /**
   * Arquitectura standalone de Angular.
   */
  standalone: true,

  /**
   * Dependencias utilizadas directamente por la plantilla.
   *
   * RouterLink permite utilizar:
   *
   * routerLink="/products"
   * routerLink="/users"
   */
  imports: [
    RouterLink
  ],

  /**
   * Plantilla HTML externa.
   */
  templateUrl: './dashboard.component.html',

  /**
   * Estilos propios del Dashboard.
   */
  styleUrl: './dashboard.component.css'

})


/**
 * ============================================================
 * CLASE DASHBOARD
 * ============================================================
 */

export class DashboardComponent {

}