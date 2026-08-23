/**
 * ============================================================
 * TAP TERMINAL
 * PRUEBAS UNITARIAS DEL NAVBAR
 * ============================================================
 *
 * Archivo:
 *
 *     src/app/shared/navbar/navbar.component.spec.ts
 *
 * Responsabilidad:
 *
 * Verificar:
 *
 *     1. Creación del componente.
 *     2. Enlace de Productos.
 *     3. Enlace de Usuarios.
 *     4. Botón de cerrar sesión.
 *     5. Estado autenticado del menú.
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
  AuthService
} from '../../services/auth.service';

import {
  NavbarComponent
} from './navbar.component';


describe('NavbarComponent', () => {

  let component:
    NavbarComponent;

  let fixture:
    ComponentFixture<NavbarComponent>;


  /**
   * ==========================================================
   * SERVICIO FALSO PARA LA PRUEBA
   * ==========================================================
   *
   * No utilizamos el AuthService real porque este componente
   * solamente necesita conocer si existe una sesión.
   *
   * El comportamiento real de AuthService se prueba
   * independientemente.
   */

  const authServiceMock = {

    isAuthenticated:
      () => true,

    logout:
      jasmine.createSpy('logout'),

    clearToken:
      jasmine.createSpy('clearToken')

  };


  /**
   * ==========================================================
   * CONFIGURACIÓN
   * ==========================================================
   */

  beforeEach(async () => {

    await TestBed.configureTestingModule({

      imports: [

        NavbarComponent

      ],

      providers: [

        provideRouter([]),

        {
          provide: AuthService,

          useValue: authServiceMock

        }

      ]

    }).compileComponents();


    fixture =
      TestBed.createComponent(
        NavbarComponent
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
   * El menú debe mostrar Productos cuando existe
   * una sesión autenticada.
   */

  it('should contain the products link', () => {

    const compiled =
      fixture.nativeElement as HTMLElement;

    const productsLink =
      compiled.querySelector(
        'a[routerLink="/products"]'
      );

    expect(
      productsLink
    ).toBeTruthy();

  });


  /**
   * ==========================================================
   * PRUEBA 3
   * ==========================================================
   *
   * El menú debe mostrar Usuarios cuando existe
   * una sesión autenticada.
   */

  it('should contain the users link', () => {

    const compiled =
      fixture.nativeElement as HTMLElement;

    const usersLink =
      compiled.querySelector(
        'a[routerLink="/users"]'
      );

    expect(
      usersLink
    ).toBeTruthy();

  });


  /**
   * ==========================================================
   * PRUEBA 4
   * ==========================================================
   *
   * El menú debe mostrar el botón de cerrar sesión.
   */

  it('should contain the logout button', () => {

    const compiled =
      fixture.nativeElement as HTMLElement;

    const logoutButton =
      compiled.querySelector(
        'button.navbar-logout'
      );

    expect(
      logoutButton
    ).toBeTruthy();

  });


  /**
   * ==========================================================
   * PRUEBA 5
   * ==========================================================
   *
   * Verifica que NavbarComponent reconozca la sesión
   * simulada por el servicio de prueba.
   */

  it('should detect authenticated state', () => {

    expect(
      component.isAuthenticated
    ).toBeTrue();

  });

});