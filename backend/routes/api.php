<?php

/*
|--------------------------------------------------------------------------
| TAP TERMINAL - API ROUTES
|--------------------------------------------------------------------------
|
| Archivo:
|
|     backend/routes/api.php
|
| Responsabilidad:
|
|     Definir todos los endpoints REST utilizados por Angular.
|
| Arquitectura:
|
|     Angular
|         ↓
|     HTTP Request
|         ↓
|     Laravel API
|         ↓
|     Middleware
|         ↓
|     Controller
|         ↓
|     Model
|         ↓
|     MongoDB
|
|--------------------------------------------------------------------------
| AUTENTICACIÓN
|--------------------------------------------------------------------------
|
| Los siguientes endpoints son públicos:
|
|     POST /api/login
|     POST /api/forgot-password
|     POST /api/reset-password
|
| El motivo es que estos endpoints se utilizan antes de que
| exista una sesión autenticada.
|
| Las operaciones administrativas requieren:
|
|     auth:sanctum
|
| El frontend envía:
|
|     Authorization: Bearer TOKEN
|
| Laravel Sanctum valida el token antes de permitir el acceso.
|
|--------------------------------------------------------------------------
| AUTORIZACIÓN
|--------------------------------------------------------------------------
|
| Además de autenticación, las secciones administrativas utilizan
| el middleware personalizado:
|
|     section
|
| Ejemplo:
|
|     section:SEC-PRODUCTS
|
| El middleware comprueba que el usuario tenga un perfil de
| autorización que incluya la sección correspondiente.
|
|--------------------------------------------------------------------------
| RECUPERACIÓN DE CONTRASEÑA
|--------------------------------------------------------------------------
|
| Flujo:
|
|     Angular
|         ↓
|     POST /api/forgot-password
|         ↓
|     AuthController
|         ↓
|     PasswordResetToken
|         ↓
|     MongoDB
|         ↓
|     PasswordResetMail
|         ↓
|     Usuario
|         ↓
|     Angular /reset-password
|         ↓
|     POST /api/reset-password
|
|--------------------------------------------------------------------------
| SECCIONES REGISTRADAS
|--------------------------------------------------------------------------
|
| Según la configuración actual del proyecto:
|
|     SEC-DASHBOARD
|         Ruta Angular: /
|
|     SEC-PRODUCTS
|         Ruta Angular: /products
|
|     SEC-USERS
|         Ruta Angular: /users
|
|     SEC-PROFILES
|         Ruta Angular: /profiles
|
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Api\AccessProfileController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SectionController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| AUTENTICACIÓN PÚBLICA
|--------------------------------------------------------------------------
|
| Estas rutas NO utilizan:
|
|     auth:sanctum
|
| porque se ejecutan antes de iniciar sesión.
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
|
| POST /api/login
|
| Ruta pública utilizada para autenticar al usuario y obtener
| un token Sanctum.
|
|--------------------------------------------------------------------------
*/

Route::post(
    'login',
    [AuthController::class, 'login']
);


/*
|--------------------------------------------------------------------------
| SOLICITAR RECUPERACIÓN DE CONTRASEÑA
|--------------------------------------------------------------------------
|
| POST /api/forgot-password
|
| Recibe:
|
|     email
|
| Genera un token de recuperación y envía un correo.
|
| No requiere autenticación porque el usuario puede haber
| olvidado su contraseña.
|
|--------------------------------------------------------------------------
*/

Route::post(
    'forgot-password',
    [AuthController::class, 'forgotPassword']
);


/*
|--------------------------------------------------------------------------
| RESTABLECER CONTRASEÑA
|--------------------------------------------------------------------------
|
| POST /api/reset-password
|
| Recibe:
|
|     email
|     token
|     password
|     password_confirmation
|
| Valida el token y establece una nueva contraseña.
|
| No requiere autenticación porque precisamente permite
| recuperar el acceso cuando no existe una sesión activa.
|
|--------------------------------------------------------------------------
*/

Route::post(
    'reset-password',
    [AuthController::class, 'resetPassword']
);


/*
|--------------------------------------------------------------------------
| RUTAS PROTEGIDAS POR AUTENTICACIÓN
|--------------------------------------------------------------------------
|
| Todas las rutas dentro de este grupo requieren un token
| válido de Laravel Sanctum.
|
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {


    /*
    |--------------------------------------------------------------------------
    | USUARIO AUTENTICADO
    |--------------------------------------------------------------------------
    |
    | GET /api/me
    |
    | Devuelve información del usuario autenticado, incluyendo:
    |
    | - Usuario.
    | - Perfiles de autorización.
    | - Secciones permitidas.
    |
    |--------------------------------------------------------------------------
    */

    Route::get(
        'me',
        [AuthController::class, 'me']
    );


    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    |
    | POST /api/logout
    |
    | Revoca el token utilizado en la petición actual.
    |
    |--------------------------------------------------------------------------
    */

    Route::post(
        'logout',
        [AuthController::class, 'logout']
    );


    /*
    |--------------------------------------------------------------------------
    | PRODUCTOS
    |--------------------------------------------------------------------------
    |
    | Sección:
    |
    |     SEC-PRODUCTS
    |
    | Ruta Angular:
    |
    |     /products
    |
    | Solamente los usuarios que tengan un perfil con la sección
    | SEC-PRODUCTS pueden utilizar este CRUD.
    |
    | Endpoints:
    |
    |     GET    /api/products
    |     POST   /api/products
    |     GET    /api/products/{product}
    |     PUT    /api/products/{product}
    |     PATCH  /api/products/{product}
    |     DELETE /api/products/{product}
    |
    |--------------------------------------------------------------------------
    */

    Route::middleware(
        'section:SEC-PRODUCTS'
    )->group(function () {

        Route::apiResource(
            'products',
            ProductController::class
        );

    });


    /*
    |--------------------------------------------------------------------------
    | USUARIOS
    |--------------------------------------------------------------------------
    |
    | Sección:
    |
    |     SEC-USERS
    |
    | Ruta Angular:
    |
    |     /users
    |
    | Solamente los usuarios que tengan un perfil con la sección
    | SEC-USERS pueden utilizar este CRUD.
    |
    | Endpoints:
    |
    |     GET    /api/users
    |     POST   /api/users
    |     GET    /api/users/{user}
    |     PUT    /api/users/{user}
    |     PATCH  /api/users/{user}
    |     DELETE /api/users/{user}
    |
    |--------------------------------------------------------------------------
    */

    Route::middleware(
        'section:SEC-USERS'
    )->group(function () {

        Route::apiResource(
            'users',
            UserController::class
        );

    });


    /*
    |--------------------------------------------------------------------------
    | PERFILES DE AUTORIZACIÓN
    |--------------------------------------------------------------------------
    |
    | Sección:
    |
    |     SEC-PROFILES
    |
    | Ruta Angular:
    |
    |     /profiles
    |
    | Los AccessProfile determinan qué secciones puede utilizar
    | un usuario.
    |
    | Endpoints:
    |
    |     GET    /api/access-profiles
    |     POST   /api/access-profiles
    |     GET    /api/access-profiles/{access_profile}
    |     PUT    /api/access-profiles/{access_profile}
    |     PATCH  /api/access-profiles/{access_profile}
    |     DELETE /api/access-profiles/{access_profile}
    |
    |--------------------------------------------------------------------------
    */

    Route::middleware(
        'section:SEC-PROFILES'
    )->group(function () {

        Route::apiResource(
            'access-profiles',
            AccessProfileController::class
        );

    });


    /*
    |--------------------------------------------------------------------------
    | SECCIONES
    |--------------------------------------------------------------------------
    |
    | Las secciones forman parte de la administración de permisos.
    |
    | En este proyecto no existe actualmente una sección:
    |
    |     SEC-SECTIONS
    |
    | registrada en MongoDB.
    |
    | Por esta razón NO protegemos este CRUD con un código inventado.
    |
    | En su lugar utilizamos:
    |
    |     SEC-PROFILES
    |
    | porque la administración de secciones forma parte de la
    | configuración de los perfiles de autorización.
    |
    | Endpoints:
    |
    |     GET    /api/sections
    |     POST   /api/sections
    |     GET    /api/sections/{section}
    |     PUT    /api/sections/{section}
    |     PATCH  /api/sections/{section}
    |     DELETE /api/sections/{section}
    |
    |--------------------------------------------------------------------------
    */

    Route::middleware(
        'section:SEC-PROFILES'
    )->group(function () {

        Route::apiResource(
            'sections',
            SectionController::class
        );

    });


    /*
    |--------------------------------------------------------------------------
    | PERFIL PERSONAL DEL USUARIO
    |--------------------------------------------------------------------------
    |
    | IMPORTANTE:
    |
    | Profile y AccessProfile son conceptos diferentes.
    |
    |--------------------------------------------------------------------------
    |
    | PROFILE
    |
    | Información personal del usuario.
    |
    | Ejemplos:
    |
    | - Datos personales.
    | - Información del perfil personal.
    |
    |--------------------------------------------------------------------------
    |
    | ACCESS PROFILE
    |
    | Información de autorización.
    |
    | Ejemplos:
    |
    | - Productos.
    | - Usuarios.
    | - Perfiles.
    |
    |--------------------------------------------------------------------------
    |
    | Estos endpoints solamente necesitan autenticación.
    |
    | Endpoints:
    |
    |     GET    /api/profile
    |     PUT    /api/profile
    |     DELETE /api/profile
    |
    |--------------------------------------------------------------------------
    */

    Route::get(
        'profile',
        [ProfileController::class, 'show']
    );


    Route::put(
        'profile',
        [ProfileController::class, 'update']
    );


    Route::delete(
        'profile',
        [ProfileController::class, 'destroy']
    );

});