<?php

namespace Database\Seeders;

use App\Models\AccessProfile;
use App\Models\Section;
use Illuminate\Database\Seeder;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL - AUTHORIZATION SEEDER
|--------------------------------------------------------------------------
|
| Archivo:
|
|     backend/database/seeders/AuthorizationSeeder.php
|
| Responsabilidad:
|
|     Crear la configuración inicial de autorización del sistema.
|
| Estructura:
|
|     User
|        |
|        v
|     UserProfile
|        |
|        v
|     AccessProfile
|        |
|        v
|     Section
|
|--------------------------------------------------------------------------
| SECCIONES INICIALES
|--------------------------------------------------------------------------
|
|     SEC-DASHBOARD
|     SEC-PRODUCTS
|     SEC-USERS
|     SEC-PROFILES
|
|--------------------------------------------------------------------------
| PERFIL INICIAL
|--------------------------------------------------------------------------
|
|     PRF-ADMIN
|
| El perfil Administrador tendrá acceso a todas las secciones
| iniciales del sistema.
|
|--------------------------------------------------------------------------
*/

class AuthorizationSeeder extends Seeder
{
    /**
     * Ejecutar la configuración inicial de autorización.
     *
     * Este método puede ejecutarse varias veces sin crear
     * registros duplicados.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | DEFINICIÓN DE SECCIONES
        |--------------------------------------------------------------------------
        |
        | Cada elemento representa una sección funcional de Angular.
        |
        */

        $sections = [
            [
                'code' => 'SEC-DASHBOARD',
                'name' => 'Dashboard',
                'description' => 'Panel principal del sistema.',
                'route' => '/',
            ],

            [
                'code' => 'SEC-PRODUCTS',
                'name' => 'Productos',
                'description' => 'Administración de productos.',
                'route' => '/products',
            ],

            [
                'code' => 'SEC-USERS',
                'name' => 'Usuarios',
                'description' => 'Administración de usuarios.',
                'route' => '/users',
            ],

            [
                'code' => 'SEC-PROFILES',
                'name' => 'Perfiles',
                'description' => 'Administración de perfiles de autorización.',
                'route' => '/profiles',
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | CREAR O ACTUALIZAR SECCIONES
        |--------------------------------------------------------------------------
        |
        | updateOrCreate() evita duplicados cuando el seeder
        | se ejecuta nuevamente.
        |
        */

        $sectionIds = [];

        foreach ($sections as $sectionData) {
            $section = Section::updateOrCreate(
                [
                    'code' => $sectionData['code'],
                ],
                [
                    'name' => $sectionData['name'],
                    'description' => $sectionData['description'],
                    'route' => $sectionData['route'],
                ]
            );

            $sectionIds[] = $section->getKey();
        }

        /*
        |--------------------------------------------------------------------------
        | PERFIL ADMINISTRADOR
        |--------------------------------------------------------------------------
        |
        | PRF-ADMIN tiene acceso a todas las secciones iniciales.
        |
        */

        AccessProfile::updateOrCreate(
            [
                'code' => 'PRF-ADMIN',
            ],
            [
                'name' => 'Administrador',
                'description' => 'Acceso completo al sistema.',
                'section_ids' => $sectionIds,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | MENSAJE DE CONFIRMACIÓN
        |--------------------------------------------------------------------------
        */

        $this->command?->info(
            'Configuración de autorización creada correctamente.'
        );

        $this->command?->info(
            'Secciones configuradas: ' . count($sectionIds)
        );

        $this->command?->info(
            'Perfil configurado: PRF-ADMIN'
        );
    }
}