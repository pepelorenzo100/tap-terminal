<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL - DATABASE SEEDER
|--------------------------------------------------------------------------
|
| Seeder principal de la aplicación.
|
| Responsabilidad:
|
|     Ejecutar los seeders necesarios para preparar
|     la base de datos de TAP Terminal.
|
| Orden de inicialización:
|
|     1. Autorización
|        ├── Secciones
|        └── Perfiles de autorización
|
|     2. Usuario de prueba
|
|--------------------------------------------------------------------------
*/

class DatabaseSeeder extends Seeder
{
    /**
     * Ejecutar los seeders principales.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AUTORIZACIÓN
        |--------------------------------------------------------------------------
        |
        | Crea las secciones iniciales y el perfil PRF-ADMIN.
        |
        */

        $this->call([
            AuthorizationSeeder::class,
        ]);


        /*
        |--------------------------------------------------------------------------
        | USUARIO DE PRUEBA
        |--------------------------------------------------------------------------
        |
        | Este usuario permite verificar:
        |
        |     Login
        |     Sanctum
        |     Perfil
        |     Autorización
        |
        | IMPORTANTE:
        |
        | No creamos un usuario adicional en cada ejecución.
        |
        */

        User::updateOrCreate(
            [
                'email' => 'test@example.com',
            ],
            [
                'code' => 'USR-000001',
                'name' => 'Test User',
                'email' => 'test@example.com',
                'phone' => null,
                'profile_photo' => null,
                'password' => 'password',
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | MENSAJE DE CONFIRMACIÓN
        |--------------------------------------------------------------------------
        */

        $this->command?->info(
            'DatabaseSeeder ejecutado correctamente.'
        );
    }
}