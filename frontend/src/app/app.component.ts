/*
 * ============================================================
 * APP COMPONENT
 * ============================================================
 *
 * Componente raíz de la aplicación Angular.
 *
 * AppComponent es el componente principal que Angular carga
 * cuando inicia nuestra aplicación.
 *
 * Su responsabilidad es servir como contenedor raíz de la
 * aplicación y proporcionar el punto donde se renderizan
 * las diferentes vistas mediante Angular Router.
 *
 * IMPORTANTE:
 *
 * La lógica específica de productos NO pertenece a este
 * componente.
 *
 * Posteriormente tendremos componentes especializados para
 * trabajar con productos, los cuales utilizarán
 * ProductService para comunicarse con la API REST de Laravel.
 *
 * De esta manera mantenemos una separación clara de
 * responsabilidades:
 *
 * AppComponent
 *     ↓
 * Contenedor principal
 *
 * ProductsComponent
 *     ↓
 * Interfaz de productos
 *
 * ProductService
 *     ↓
 * Comunicación HTTP
 *
 * Laravel API
 *     ↓
 * Base de datos
 */


/*
 * ============================================================
 * IMPORTACIONES
 * ============================================================
 *
 * Component:
 *
 * Es el decorador que permite declarar una clase como un
 * componente de Angular.
 *
 * RouterOutlet:
 *
 * Es el componente/directiva que funciona como punto de
 * inserción para las vistas administradas por Angular Router.
 *
 * Por ejemplo:
 *
 * /products
 *      ↓
 * Angular Router
 *      ↓
 * ProductsComponent
 *      ↓
 * router-outlet
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';


/*
 * ============================================================
 * APP COMPONENT
 * ============================================================
 *
 * @Component es el decorador que proporciona a Angular la
 * configuración necesaria para convertir esta clase en un
 * componente.
 */
@Component({

  /*
   * standalone:
   *
   * Indica que el componente utiliza la arquitectura
   * standalone de Angular.
   *
   * En esta arquitectura no necesitamos declarar el componente
   * dentro de un NgModule tradicional.
   */
  standalone: true,


  /*
   * selector:
   *
   * Define el elemento HTML que representa este componente.
   *
   * Angular utiliza "app-root" como elemento raíz de la
   * aplicación.
   *
   * Este elemento se encuentra en:
   *
   * src/index.html
   */
  selector: 'app-root',


  /*
   * imports:
   *
   * Contiene las dependencias que necesita directamente la
   * plantilla de este componente.
   *
   * RouterOutlet es necesario porque app.component.html
   * utiliza:
   *
   * <router-outlet></router-outlet>
   *
   * Sin esta importación Angular no podría reconocer
   * RouterOutlet dentro de la plantilla.
   */
  imports: [
    RouterOutlet
  ],


  /*
   * templateUrl:
   *
   * Indica que la estructura HTML del componente se encuentra
   * en un archivo externo.
   *
   * Esto permite separar:
   *
   * TypeScript → lógica
   * HTML       → estructura
   * CSS        → presentación
   */
  templateUrl: './app.component.html',


  /*
   * styleUrl:
   *
   * Indica el archivo CSS asociado específicamente con este
   * componente.
   *
   * Los estilos se mantienen separados del HTML para conservar
   * una estructura organizada y facilitar el mantenimiento.
   */
  styleUrl: './app.component.css'

})


/*
 * ============================================================
 * CLASE APP COMPONENT
 * ============================================================
 *
 * Esta clase representa el componente raíz de nuestra
 * aplicación.
 *
 * Actualmente no necesitamos lógica adicional dentro de la
 * clase porque su responsabilidad principal es proporcionar
 * el contenedor de la aplicación y el RouterOutlet.
 *
 * Conforme el proyecto crezca, evitaremos colocar aquí lógica
 * específica de productos para mantener una arquitectura
 * limpia.
 */
export class AppComponent {

}