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
| Este archivo configura la aplicación principal de Laravel 11.
|
| Aquí se registran:
|
| - Rutas web.
| - Rutas API.
| - Comandos Artisan.
| - Endpoint de comprobación de salud.
| - Alias de middleware personalizados.
| - Manejo de excepciones.
| - Respuestas JSON para la API.
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
| AUTENTICACIÓN
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
|
| AUTORIZACIÓN
|--------------------------------------------------------------------------
|
| TAP Terminal utiliza además un middleware personalizado:
|
|     CheckSectionPermission
|
| Alias:
|
|     section
|
| Ejemplo de utilización:
|
|     ->middleware('section:SEC-PRODUCTS')
|
| Este middleware permite comprobar que el usuario autenticado
| tenga asignada la sección correspondiente mediante sus perfiles
| de autorización.
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
| Application::configure() inicia la configuración de Laravel.
|
| basePath:
|
|     dirname(__DIR__)
|
| apunta al directorio raíz del backend.
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
| Permite comprobar que Laravel está funcionando.
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
| utilizados por la aplicación.
|
|--------------------------------------------------------------------------
| MIDDLEWARE PERSONALIZADO
|--------------------------------------------------------------------------
|
| Registramos el alias:
|
|     section
|
| para nuestro middleware:
|
|     CheckSectionPermission
|
| Esto permite utilizarlo directamente desde routes/api.php:
|
|     ->middleware('section:SEC-PRODUCTS')
|
| El middleware comprueba:
|
|     Usuario
|         ↓
|     UserProfile
|         ↓
|     AccessProfile
|         ↓
|     Section
|
|--------------------------------------------------------------------------
| AUTENTICACIÓN API
|--------------------------------------------------------------------------
|
| Las rutas protegidas utilizan:
|
|     auth:sanctum
|
| Si el usuario no está autenticado, la API debe responder
| con HTTP 401 y no realizar una redirección HTML.
|
|--------------------------------------------------------------------------
*/

->withMiddleware(function (Middleware $middleware) {

    /*
    |--------------------------------------------------------------------------
    | ALIAS DEL MIDDLEWARE DE PERMISOS
    |--------------------------------------------------------------------------
    |
    | Registramos el middleware encargado de comprobar permisos
    | por sección.
    |
    | Alias:
    |
    |     section
    |
    | Ejemplos:
    |
    |     section:SEC-PRODUCTS
    |     section:SEC-USERS
    |     section:SEC-PROFILES
    |     section:SEC-SECTIONS
    |
    */

    $middleware->alias([
        'section' =>
            \App\Http\Middleware\CheckSectionPermission::class,
    ]);


    /*
    |--------------------------------------------------------------------------
    | REDIRECCIÓN DE USUARIOS NO AUTENTICADOS
    |--------------------------------------------------------------------------
    |
    | redirectGuestsTo() permite definir qué sucede cuando
    | auth:sanctum encuentra una petición sin autenticación.
    |
    */

    $middleware->redirectGuestsTo(function (Request $request) {

        /*
        |--------------------------------------------------------------------------
        | PETICIÓN API
        |--------------------------------------------------------------------------
        |
        | Las peticiones API no deben ser redirigidas hacia
        | una página de login de Laravel.
        |
        | Angular controla la pantalla:
        |
        |     /login
        |
        | Por eso devolvemos null.
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
        | Para rutas web tradicionales mantenemos el comportamiento
        | estándar utilizando la ruta "login".
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
| Las rutas API deben responder utilizando JSON.
|
| Esto permite que Angular pueda interpretar correctamente:
|
|     401 Unauthorized
|     403 Forbidden
|     404 Not Found
|     422 Validation Error
|     500 Server Error
|
|--------------------------------------------------------------------------
*/

->withExceptions(function (Exceptions $exceptions) {

    /*
    |--------------------------------------------------------------------------
    | RESPUESTAS JSON PARA API
    |--------------------------------------------------------------------------
    |
    | shouldRenderJsonWhen() indica a Laravel que las excepciones
    | producidas por endpoints /api/* deben representarse como JSON.
    |
    */

    $exceptions->shouldRenderJsonWhen(
        function (Request $request) {

            /*
            |--------------------------------------------------------------------------
            | PETICIONES API
            |--------------------------------------------------------------------------
            |
            | Toda ruta cuyo patrón sea:
            |
            |     /api/*
            |
            | debe recibir una respuesta JSON.
            |
            */

            if ($request->is('api/*')) {
                return true;
            }


            /*
            |--------------------------------------------------------------------------
            | PETICIONES QUE ESPERAN JSON
            |--------------------------------------------------------------------------
            |
            | También conservamos el comportamiento estándar cuando
            | el cliente explícitamente solicita JSON.
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
| Finalmente se construye la instancia de Laravel.
|
|--------------------------------------------------------------------------
*/

->create();