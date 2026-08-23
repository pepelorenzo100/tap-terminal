/**
 * ============================================================
 * TAP TERMINAL
 * PRUEBAS UNITARIAS DEL DASHBOARD
 * ============================================================
 *
 * Archivo:
 * dashboard.component.spec.ts
 *
 * Responsabilidad:
 *
 * Verificar que:
 *
 * 1. DashboardComponent pueda crearse.
 * 2. Se muestre el encabezado de TAP Terminal.
 * 3. Exista el enlace hacia Productos.
 * 4. Exista el enlace hacia Usuarios.
 *
 * ============================================================
 */

import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter
} from '@angular/router';

import {
  DashboardComponent
} from './dashboard.component';


/**
 * ============================================================
 * SUITE DE PRUEBAS
 * ============================================================
 */

describe('DashboardComponent', () => {

  let component: DashboardComponent;

  let fixture:
    ComponentFixture<DashboardComponent>;


  /**
   * ==========================================================
   * CONFIGURACIÓN
   * ==========================================================
   */

  beforeEach(async () => {

    await TestBed.configureTestingModule({

      imports: [
        DashboardComponent
      ],

      providers: [
        provideRouter([])
      ]

    }).compileComponents();


    fixture =
      TestBed.createComponent(
        DashboardComponent
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();

  });


  /**
   * ==========================================================
   * PRUEBA 1
   * ==========================================================
   */

  it('should create', () => {

    expect(
      component
    ).toBeTruthy();

  });


  /**
   * ==========================================================
   * PRUEBA 2
   * ==========================================================
   *
   * Verifica el encabezado principal.
   */

  it('should display TAP Terminal heading', () => {

    const compiled =
      fixture.nativeElement as HTMLElement;

    const heading =
      compiled.querySelector('h1');

    expect(
      heading?.textContent
    ).toContain('TAP Terminal');

  });


  /**
   * ==========================================================
   * PRUEBA 3
   * ==========================================================
   *
   * Verifica el acceso a Productos.
   */

  it('should contain the products link', () => {

    const compiled =
      fixture.nativeElement as HTMLElement;

    const productsLink =
      compiled.querySelector(
        'a[href="/products"]'
      );

    expect(
      productsLink
    ).toBeTruthy();

  });


  /**
   * ==========================================================
   * PRUEBA 4
   * ==========================================================
   *
   * Verifica el acceso a Usuarios.
   */

  it('should contain the users link', () => {

    const compiled =
      fixture.nativeElement as HTMLElement;

    const usersLink =
      compiled.querySelector(
        'a[href="/users"]'
      );

    expect(
      usersLink
    ).toBeTruthy();

  });

});