<?php

/*
|--------------------------------------------------------------------------
| TAP TERMINAL - APPLICATION BOOTSTRAP
|--------------------------------------------------------------------------
|
| Archivo:
|     bootstrap/app.php
|
| Responsabilidad:
|
| Este archivo configura la aplicación principal de Laravel.
|
| Aquí se registran:
|
| - Rutas web.
| - Rutas API.
| - Comandos Artisan.
| - Endpoint de comprobación de salud.
| - Middleware.
| - Manejo de excepciones.
|
|--------------------------------------------------------------------------
|
| FLUJO GENERAL
|--------------------------------------------------------------------------
|
| Angular
|    ↓
| HTTP Request
|    ↓
| Laravel
|    ↓
| Middleware
|    ↓
| routes/api.php
|    ↓
| Controller
|    ↓
| Model
|    ↓
| MongoDB
|
|--------------------------------------------------------------------------
|
| AUTENTICACIÓN API
|--------------------------------------------------------------------------
|
| Las rutas protegidas utilizan:
|
|     auth:sanctum
|
| Cuando una petición API no tiene un token válido,
| debe responder:
|
|     HTTP 401 Unauthorized
|
| y no intentar redirigir al usuario hacia una ruta web
| llamada "login".
|
| Angular es quien controla la navegación hacia:
|
|     /login
|
|--------------------------------------------------------------------------
*/

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;


/*
|--------------------------------------------------------------------------
| CREAR CONFIGURACIÓN PRINCIPAL DE LARAVEL
|--------------------------------------------------------------------------
|
| Application::configure() inicia la configuración de la aplicación.
|
| basePath:
|
|     dirname(__DIR__)
|
| apunta al directorio raíz del backend Laravel.
|
|--------------------------------------------------------------------------
*/

return Application::configure(
    basePath: dirname(__DIR__)
)


/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN DE RUTAS
|--------------------------------------------------------------------------
|
| Laravel utiliza diferentes archivos para organizar las rutas.
|
|--------------------------------------------------------------------------
|
| WEB
|
| routes/web.php
|
| Contiene las rutas web tradicionales de Laravel.
|
|--------------------------------------------------------------------------
|
| API
|
| routes/api.php
|
| Contiene los endpoints REST utilizados por Angular.
|
| Ejemplos:
|
|     POST /api/login
|     GET  /api/me
|     GET  /api/products
|     GET  /api/users
|
|--------------------------------------------------------------------------
|
| COMMANDS
|
| routes/console.php
|
| Contiene los comandos Artisan del proyecto.
|
|--------------------------------------------------------------------------
|
| HEALTH
|
| /up
|
| Permite comprobar que la aplicación Laravel
| está funcionando correctamente.
|
|--------------------------------------------------------------------------
*/

->withRouting(

    /*
    |--------------------------------------------------------------------------
    | RUTAS WEB
    |--------------------------------------------------------------------------
    */

    web: __DIR__.'/../routes/web.php',


    /*
    |--------------------------------------------------------------------------
    | RUTAS API
    |--------------------------------------------------------------------------
    */

    api: __DIR__.'/../routes/api.php',


    /*
    |--------------------------------------------------------------------------
    | COMANDOS ARTISAN
    |--------------------------------------------------------------------------
    */

    commands: __DIR__.'/../routes/console.php',


    /*
    |--------------------------------------------------------------------------
    | HEALTH CHECK
    |--------------------------------------------------------------------------
    */

    health: '/up',

)


/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN DE MIDDLEWARE
|--------------------------------------------------------------------------
|
| Aquí configuramos el comportamiento de los middleware
| de la aplicación.
|
|--------------------------------------------------------------------------
|
| PROBLEMA QUE ESTAMOS CORRIGIENDO
|--------------------------------------------------------------------------
|
| Las rutas:
|
|     /api/products
|     /api/users
|     /api/me
|     /api/logout
|
| están protegidas mediante:
|
|     auth:sanctum
|
| Si una petición llega sin autenticación, Laravel puede intentar
| redirigir al usuario hacia:
|
|     route('login')
|
| El problema es que TAP Terminal no tiene una ruta web llamada
| "login". El login pertenece a Angular.
|
| Por eso una petición API sin token estaba provocando:
|
|     Route [login] not defined
|
| y posteriormente:
|
|     HTTP 500 Internal Server Error
|
|--------------------------------------------------------------------------
|
| COMPORTAMIENTO DESEADO
|--------------------------------------------------------------------------
|
| Para las rutas API:
|
|     /api/*
|
| NO queremos redirección.
|
| Queremos que Laravel devuelva:
|
|     HTTP 401 Unauthorized
|
|--------------------------------------------------------------------------
*/

->withMiddleware(function (Middleware $middleware) {

    /*
    |--------------------------------------------------------------------------
    | REDIRECCIÓN DE USUARIOS NO AUTENTICADOS
    |--------------------------------------------------------------------------
    |
    | redirectGuestsTo() permite definir el comportamiento
    | cuando el middleware de autenticación encuentra un usuario
    | que no está autenticado.
    |
    */

    $middleware->redirectGuestsTo(function (Request $request) {

        /*
        |--------------------------------------------------------------------------
        | PETICIÓN API
        |--------------------------------------------------------------------------
        |
        | Las peticiones API no deben ser redirigidas.
        |
        | Devolvemos null para que Laravel continúe con el
        | comportamiento de autenticación correspondiente.
        |
        */

        if ($request->is('api/*')) {
            return null;
        }


        /*
        |--------------------------------------------------------------------------
        | PETICIÓN WEB
        |--------------------------------------------------------------------------
        |
        | Para una ruta web tradicional mantenemos el comportamiento
        | normal de Laravel utilizando la ruta "login".
        |
        */

        return route('login');
    });

})


/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN DE EXCEPCIONES
|--------------------------------------------------------------------------
|
| Esta sección determina cómo Laravel representa las excepciones
| producidas durante una petición HTTP.
|
|--------------------------------------------------------------------------
|
| API
|--------------------------------------------------------------------------
|
| Todas las rutas:
|
|     /api/*
|
| deben utilizar respuestas JSON.
|
| Esto es importante porque Angular consume la API mediante HTTP
| y necesita recibir códigos HTTP y objetos JSON en lugar de
| redirecciones HTML.
|
|--------------------------------------------------------------------------
*/

->withExceptions(function (Exceptions $exceptions) {

    /*
    |--------------------------------------------------------------------------
    | DETERMINAR CUÁNDO RESPONDER CON JSON
    |--------------------------------------------------------------------------
    |
    | shouldRenderJsonWhen() permite indicar a Laravel que una
    | excepción debe representarse como JSON.
    |
    */

    $exceptions->shouldRenderJsonWhen(
        function (Request $request) {

            /*
            |--------------------------------------------------------------------------
            | PETICIONES API
            |--------------------------------------------------------------------------
            |
            | Toda petición cuyo path comience por:
            |
            |     /api/
            |
            | debe recibir una respuesta JSON.
            |
            */

            if ($request->is('api/*')) {
                return true;
            }


            /*
            |--------------------------------------------------------------------------
            | PETICIONES QUE YA SOLICITAN JSON
            |--------------------------------------------------------------------------
            |
            | Conservamos el comportamiento estándar de Laravel
            | cuando el cliente indica que espera JSON.
            |
            */

            return $request->expectsJson();
        }
    );

})


/*
|--------------------------------------------------------------------------
| CREAR APLICACIÓN
|--------------------------------------------------------------------------
|
| Finalmente creamos la instancia de la aplicación Laravel.
|
|--------------------------------------------------------------------------
*/

->create();