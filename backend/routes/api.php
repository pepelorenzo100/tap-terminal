<?php

/*
|--------------------------------------------------------------------------
| TAP TERMINAL - API ROUTES
|--------------------------------------------------------------------------
|
| Este archivo define las rutas REST utilizadas por Angular.
|
| Recursos disponibles:
|
| - Authentication
| - Products
| - Users
|
| Flujo:
|
| Angular
|    ↓
| HTTP Request
|    ↓
| Laravel API
|    ↓
| Controller
|    ↓
| Model
|    ↓
| MongoDB
|
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| AUTHENTICATION API
|--------------------------------------------------------------------------
|
| Estas rutas permiten iniciar y cerrar sesión.
|
| POST /api/login
| POST /api/logout
| GET  /api/me
|
| /login es público.
|
| /logout y /me requieren autenticación mediante Sanctum.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
|
| El usuario proporciona:
|
| email
| password
|
| El endpoint devuelve un token Bearer.
|
*/

Route::post(
    'login',
    [AuthController::class, 'login']
);

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
|
| Las siguientes rutas requieren un usuario autenticado.
|
*/

Route::middleware('auth:sanctum')->group(function () {
    /*
    |--------------------------------------------------------------------------
    | USUARIO AUTENTICADO
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
    */

    Route::post(
        'logout',
        [AuthController::class, 'logout']
    );
});

/*
|--------------------------------------------------------------------------
| PRODUCT API
|--------------------------------------------------------------------------
|
| CRUD completo de productos.
|
| GET       /api/products
| POST      /api/products
| GET       /api/products/{product}
| PUT       /api/products/{product}
| PATCH     /api/products/{product}
| DELETE    /api/products/{product}
|
| IMPORTANTE:
|
| El CRUD de productos permanece sin autenticación por ahora.
|
| Posteriormente decidiremos qué operaciones requieren
| autenticación y permisos.
|
|--------------------------------------------------------------------------
*/

Route::apiResource(
    'products',
    ProductController::class
);

/*
|--------------------------------------------------------------------------
| USER API
|--------------------------------------------------------------------------
|
| CRUD completo de usuarios.
|
| GET       /api/users
| POST      /api/users
| GET       /api/users/{user}
| PUT       /api/users/{user}
| PATCH     /api/users/{user}
| DELETE    /api/users/{user}
|
| IMPORTANTE:
|
| El CRUD de usuarios permanece sin autenticación por ahora.
|
| No modificamos esta parte hasta terminar y probar
| correctamente el sistema de autenticación.
|
|--------------------------------------------------------------------------
*/

Route::apiResource(
    'users',
    UserController::class
);
