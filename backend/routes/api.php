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

use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

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
*/

Route::apiResource(
    'users',
    UserController::class
);
