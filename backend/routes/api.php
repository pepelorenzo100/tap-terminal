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
| Flujo general:
|
| Angular
|    ↓
| HTTP Request
|    ↓
| Laravel API
|    ↓
| Middleware
|    ↓
| Controller
|    ↓
| Model
|    ↓
| MongoDB
|
|--------------------------------------------------------------------------
|
| AUTENTICACIÓN
|
| El endpoint /login es público porque permite obtener
| el token de autenticación.
|
| Las rutas protegidas utilizan:
|
|     auth:sanctum
|
| El cliente Angular envía:
|
|     Authorization: Bearer TOKEN
|
| Laravel Sanctum valida el token antes de permitir
| el acceso al controlador.
|
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
|
| Endpoint:
|
|     POST /api/login
|
| Esta ruta es pública.
|
| El usuario proporciona:
|
|     email
|     password
|     device_name (opcional)
|
| Si las credenciales son correctas, AuthController genera
| un token mediante Laravel Sanctum.
|
|--------------------------------------------------------------------------
*/

Route::post(
    'login',
    [AuthController::class, 'login']
);


/*
|--------------------------------------------------------------------------
| RUTAS PROTEGIDAS
|--------------------------------------------------------------------------
|
| Todas las rutas definidas dentro de este grupo requieren
| autenticación mediante Laravel Sanctum.
|
| Middleware:
|
|     auth:sanctum
|
| Flujo:
|
| Angular
|    ↓
| AuthInterceptor
|    ↓
| Authorization: Bearer TOKEN
|    ↓
| Laravel
|    ↓
| auth:sanctum
|    ↓
| Controller
|
| Si el token es válido:
|
|     acceso permitido
|
| Si el token es inválido, inexistente o revocado:
|
|     HTTP 401 Unauthorized
|
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {


    /*
    |--------------------------------------------------------------------------
    | USUARIO AUTENTICADO
    |--------------------------------------------------------------------------
    |
    | Endpoint:
    |
    |     GET /api/me
    |
    | Permite obtener la información del usuario
    | correspondiente al token autenticado.
    |
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
    | Endpoint:
    |
    |     POST /api/logout
    |
    | Requiere autenticación.
    |
    | AuthController elimina el token utilizado
    | en la petición actual.
    |
    */

    Route::post(
        'logout',
        [AuthController::class, 'logout']
    );


    /*
    |--------------------------------------------------------------------------
    | PRODUCT API
    |--------------------------------------------------------------------------
    |
    | CRUD completo de productos.
    |
    | Todos estos endpoints requieren autenticación.
    |
    | GET:
    |
    |     /api/products
    |
    | POST:
    |
    |     /api/products
    |
    | GET:
    |
    |     /api/products/{product}
    |
    | PUT:
    |
    |     /api/products/{product}
    |
    | PATCH:
    |
    |     /api/products/{product}
    |
    | DELETE:
    |
    |     /api/products/{product}
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
    | Todos estos endpoints requieren autenticación.
    |
    | GET:
    |
    |     /api/users
    |
    | POST:
    |
    |     /api/users
    |
    | GET:
    |
    |     /api/users/{user}
    |
    | PUT:
    |
    |     /api/users/{user}
    |
    | PATCH:
    |
    |     /api/users/{user}
    |
    | DELETE:
    |
    |     /api/users/{user}
    |
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'users',
        UserController::class
    );

});