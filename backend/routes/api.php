<?php

/*
|--------------------------------------------------------------------------
| TAP TERMINAL
| API ROUTES
|--------------------------------------------------------------------------
|
| Archivo:
| routes/api.php
|
| Tipo:
| BACKEND - Laravel / PHP
|
| Responsabilidad:
|
| Este archivo define las rutas HTTP de la API REST
| utilizadas por el frontend Angular.
|
| Flujo:
|
| Angular
|    ↓
| ProductService
|    ↓
| HTTP Request
|    ↓
| routes/api.php
|    ↓
| ProductController
|    ↓
| Product Model
|    ↓
| MongoDB
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| IMPORTACIÓN DEL CONTROLADOR
|--------------------------------------------------------------------------
|
| ProductController contiene la lógica de negocio necesaria
| para administrar los productos.
|
| Namespace:
|
| App\Http\Controllers\Api\ProductController
|
*/

use App\Http\Controllers\Api\ProductController;


/*
|--------------------------------------------------------------------------
| IMPORTACIÓN DE ROUTE
|--------------------------------------------------------------------------
|
| Route permite registrar las rutas HTTP de Laravel.
|
*/

use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| PRODUCT API
|--------------------------------------------------------------------------
|
| Route::apiResource() genera automáticamente las rutas
| REST principales para el recurso "products".
|
| Equivale conceptualmente a registrar:
|
| GET       /api/products
| POST      /api/products
| GET       /api/products/{product}
| PUT       /api/products/{product}
| PATCH     /api/products/{product}
| DELETE    /api/products/{product}
|
| Todas las operaciones son dirigidas hacia:
|
| ProductController
|
|--------------------------------------------------------------------------
*/


Route::apiResource(
    'products',
    ProductController::class
);