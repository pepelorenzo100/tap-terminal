/**
 * ============================================================
 * TAP TERMINAL
 * PRUEBAS UNITARIAS DEL COMPONENTE RAÍZ
 * ============================================================
 *
 * Archivo:
 *
 *     src/app/app.component.spec.ts
 *
 * Responsabilidad:
 *
 * Verificar que AppComponent:
 *
 *     1. Se pueda crear.
 *     2. Contenga el Navbar.
 *     3. Contenga el RouterOutlet.
 *
 * ============================================================
 */

import {
  TestBed
} from '@angular/core/testing';

import {
  provideHttpClient
} from '@angular/common/http';

import {
  provideRouter
} from '@angular/router';

import {
  AppComponent
} from './app.component';


describe('AppComponent', () => {


  /**
   * ==========================================================
   * CONFIGURACIÓN
   * ==========================================================
   *
   * AppComponent utiliza NavbarComponent.
   *
   * NavbarComponent utiliza AuthService.
   *
   * AuthService necesita HttpClient.
   *
   * Por eso proporcionamos HttpClient y Router.
   */

  beforeEach(async () => {

    await TestBed.configureTestingModule({

      imports: [
        AppComponent
      ],

      providers: [
        provideHttpClient(),
        provideRouter([])
      ]

    }).compileComponents();

  });


  /**
   * ==========================================================
   * PRUEBA 1
   * ==========================================================
   *
   * Verifica que el componente raíz pueda crearse.
   */

  it('should create the app', () => {

    const fixture =
      TestBed.createComponent(
        AppComponent
      );

    const app =
      fixture.componentInstance;

    expect(app).toBeTruthy();

  });


  /**
   * ==========================================================
   * PRUEBA 2
   * ==========================================================
   *
   * Verifica que el Navbar esté presente.
   *
   * El Navbar forma parte de la estructura principal
   * de TAP Terminal.
   */

  it('should contain the navbar', () => {

    const fixture =
      TestBed.createComponent(
        AppComponent
      );

    fixture.detectChanges();

    const compiled =
      fixture.nativeElement as HTMLElement;

    const navbar =
      compiled.querySelector(
        'app-navbar'
      );

    expect(navbar).toBeTruthy();

  });


  /**
   * ==========================================================
   * PRUEBA 3
   * ==========================================================
   *
   * Verifica que exista RouterOutlet.
   *
   * RouterOutlet permite cargar:
   *
   *     /login
   *     /products
   *     /users
   */

  it('should contain the router outlet', () => {

    const fixture =
      TestBed.createComponent(
        AppComponent
      );

    fixture.detectChanges();

    const compiled =
      fixture.nativeElement as HTMLElement;

    const routerOutlet =
      compiled.querySelector(
        'router-outlet'
      );

    expect(routerOutlet).toBeTruthy();

  });

});