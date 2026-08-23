/**
 * ============================================================
 * TAP TERMINAL
 * APP COMPONENT
 * ============================================================
 *
 * Componente raíz de la aplicación.
 *
 * Responsabilidades:
 *
 *     - Mostrar el menú principal.
 *     - Proporcionar el RouterOutlet.
 *     - Servir como contenedor común de las páginas.
 *
 * Arquitectura:
 *
 *     AppComponent
 *          |
 *          +----> NavbarComponent
 *          |
 *          +----> RouterOutlet
 *                         |
 *                         +----> /products
 *                         |
 *                         +----> /users
 *
 * ============================================================
 */

import {
  Component
} from '@angular/core';

import {
  RouterOutlet
} from '@angular/router';

import {
  NavbarComponent
} from './shared/navbar/navbar.component';


/**
 * ============================================================
 * APP COMPONENT
 * ============================================================
 */

@Component({

  /**
   * Elemento raíz utilizado por Angular.
   */

  selector: 'app-root',


  /**
   * Aplicación standalone.
   */

  standalone: true,


  /**
   * Componentes/directivas utilizados
   * directamente por app.component.html.
   */

  imports: [

    /**
     * Menú principal.
     */

    NavbarComponent,


    /**
     * Contenedor de las rutas.
     */

    RouterOutlet

  ],


  /**
   * Plantilla principal.
   */

  templateUrl:
    './app.component.html',


  /**
   * Estilos del componente raíz.
   */

  styleUrl:
    './app.component.css'

})


/**
 * ============================================================
 * CLASE
 * ============================================================
 */

export class AppComponent {

}