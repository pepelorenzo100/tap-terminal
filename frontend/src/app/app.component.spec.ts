/**
 * ============================================================
 * TAP TERMINAL
 * PRUEBAS UNITARIAS DEL COMPONENTE RAÍZ
 * ============================================================
 *
 * Archivo:
 * app.component.spec.ts
 *
 * Tipo:
 * FRONTEND - Angular / TypeScript / Jasmine
 *
 * Responsabilidad:
 *
 * Verificar que AppComponent:
 *
 * 1. Se pueda crear correctamente.
 * 2. Renderice el contenedor principal.
 * 3. Contenga el RouterOutlet utilizado para mostrar
 *    las diferentes vistas de la aplicación.
 *
 * IMPORTANTE:
 *
 * Este archivo reemplaza las pruebas iniciales generadas
 * automáticamente por Angular.
 *
 * Las pruebas originales comprobaban:
 *
 * - title === 'frontend'
 * - "Hello, frontend"
 *
 * Esas propiedades ya no existen en TAP Terminal.
 *
 * ============================================================
 */


/**
 * ============================================================
 * IMPORTACIONES
 * ============================================================
 */

/**
 * TestBed:
 *
 * Herramienta de Angular utilizada para crear un entorno
 * controlado donde podemos probar componentes.
 */
import {
  TestBed
} from '@angular/core/testing';


/**
 * AppComponent:
 *
 * Componente raíz que vamos a probar.
 */
import {
  AppComponent
} from './app.component';


/**
 * ============================================================
 * SUITE DE PRUEBAS
 * ============================================================
 *
 * describe() agrupa las pruebas relacionadas con
 * AppComponent.
 */
describe('AppComponent', () => {


  /**
   * ==========================================================
   * CONFIGURACIÓN ANTES DE CADA PRUEBA
   * ==========================================================
   *
   * beforeEach() se ejecuta antes de cada prueba.
   *
   * Configuramos AppComponent dentro del TestBed.
   *
   * AppComponent es standalone, por lo que se agrega
   * directamente en imports.
   */
  beforeEach(async () => {

    await TestBed.configureTestingModule({

      imports: [

        AppComponent

      ]

    }).compileComponents();

  });


  /**
   * ==========================================================
   * PRUEBA 1
   * ==========================================================
   *
   * Verifica que Angular pueda crear correctamente
   * una instancia de AppComponent.
   *
   * Si app === undefined o null, la prueba falla.
   */
  it('should create the app', () => {


    /**
     * Creamos una instancia de prueba del componente.
     */
    const fixture =
      TestBed.createComponent(AppComponent);


    /**
     * Obtenemos la instancia de AppComponent.
     */
    const app =
      fixture.componentInstance;


    /**
     * Verificamos que exista.
     */
    expect(app).toBeTruthy();

  });


  /**
   * ==========================================================
   * PRUEBA 2
   * ==========================================================
   *
   * Verifica que la plantilla principal de TAP Terminal
   * contenga el encabezado esperado.
   *
   * Nuestro app.component.html contiene:
   *
   * <h1>TAP Terminal</h1>
   */
  it('should render TAP Terminal', () => {


    /**
     * Creamos la instancia del componente.
     */
    const fixture =
      TestBed.createComponent(AppComponent);


    /**
     * Ejecutamos la detección de cambios para que Angular
     * procese y renderice la plantilla HTML.
     */
    fixture.detectChanges();


    /**
     * Obtenemos el elemento HTML generado.
     */
    const compiled =
      fixture.nativeElement as HTMLElement;


    /**
     * Buscamos el elemento h1.
     */
    const heading =
      compiled.querySelector('h1');


    /**
     * Verificamos que el encabezado contenga
     * el nombre de nuestro sistema.
     */
    expect(
      heading?.textContent
    ).toContain('TAP Terminal');

  });


  /**
   * ==========================================================
   * PRUEBA 3
   * ==========================================================
   *
   * Verifica que la aplicación tenga disponible
   * el RouterOutlet.
   *
   * RouterOutlet es importante porque permite que Angular
   * renderice ProductsComponent cuando navegamos a:
   *
   * /products
   *
   * La existencia del RouterOutlet forma parte de la
   * estructura principal de AppComponent.
   */
  it('should contain the router outlet', () => {


    /**
     * Creamos la instancia del componente.
     */
    const fixture =
      TestBed.createComponent(AppComponent);


    /**
     * Ejecutamos la detección de cambios.
     */
    fixture.detectChanges();


    /**
     * Obtenemos el HTML generado.
     */
    const compiled =
      fixture.nativeElement as HTMLElement;


    /**
     * Buscamos el elemento router-outlet.
     *
     * Angular representa el RouterOutlet como un elemento
     * <router-outlet> dentro del DOM.
     */
    const routerOutlet =
      compiled.querySelector('router-outlet');


    /**
     * Verificamos que exista.
     */
    expect(routerOutlet).toBeTruthy();

  });

});