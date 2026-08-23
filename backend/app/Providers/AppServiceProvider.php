<?php

namespace App\Providers;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL
| APPLICATION SERVICE PROVIDER
|--------------------------------------------------------------------------
|
| Este proveedor registra configuraciones generales
| utilizadas por la aplicación.
|
*/

use App\Models\PersonalAccessToken;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        /*
        |--------------------------------------------------------------------------
        | SANCTUM + MONGODB
        |--------------------------------------------------------------------------
        |
        | Indicamos a Sanctum que utilice nuestro modelo
        | compatible con MongoDB para almacenar los tokens.
        |
        */

        Sanctum::usePersonalAccessTokenModel(
            PersonalAccessToken::class
        );
    }
}
