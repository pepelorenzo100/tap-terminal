<?php

namespace App\Http\Middleware;

use App\Models\AccessProfile;
use App\Models\Section;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL - CHECK SECTION PERMISSION
|--------------------------------------------------------------------------
|
| Archivo:
|
|     backend/app/Http/Middleware/CheckSectionPermission.php
|
| Responsabilidad:
|
|     Verificar que el usuario autenticado tenga autorización para
|     acceder a una sección determinada del sistema.
|
| Flujo de autorización:
|
|     Request
|        ↓
|     Usuario autenticado
|        ↓
|     UserProfile
|        ↓
|     AccessProfile
|        ↓
|     section_ids
|        ↓
|     Section
|
| Uso:
|
|     ->middleware('section:SEC-PRODUCTS')
|
| El parámetro recibido puede ser:
|
|     - Código de sección:
|           SEC-PRODUCTS
|
|     - ID de sección:
|           ObjectId/string
|
| Respuestas:
|
|     401 → Usuario no autenticado.
|
|     403 → Usuario autenticado pero sin permiso.
|
|--------------------------------------------------------------------------
*/

class CheckSectionPermission
{
    /**
     * ============================================================
     * PROCESAR PETICIÓN
     * ============================================================
     *
     * Comprueba que el usuario autenticado tenga acceso a la
     * sección indicada por el parámetro del middleware.
     *
     * Ejemplo:
     *
     *     section:SEC-PRODUCTS
     */
    public function handle(
        Request $request,
        Closure $next,
        string $section
    ): Response {
        /*
        |--------------------------------------------------------------------------
        | OBTENER USUARIO AUTENTICADO
        |--------------------------------------------------------------------------
        |
        | Este middleware se ejecuta después de:
        |
        |     auth:sanctum
        |
        | Sin embargo, se realiza la comprobación nuevamente para evitar
        | asumir que siempre existe un usuario autenticado.
        |
        */

        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'No autenticado.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | OBTENER PERFILES DEL USUARIO
        |--------------------------------------------------------------------------
        |
        | Un usuario puede tener uno o varios perfiles de autorización.
        |
        */

        $userProfiles = $user
            ->userProfiles()
            ->get();

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR QUE EXISTAN PERFILES
        |--------------------------------------------------------------------------
        */

        if ($userProfiles->isEmpty()) {
            return response()->json([
                'message' =>
                    'No tienes perfiles de autorización asignados.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | OBTENER IDS DE LOS PERFILES
        |--------------------------------------------------------------------------
        |
        | UserProfile almacena la referencia al AccessProfile mediante
        | profile_id.
        |
        | Se convierten los valores a string para mantener compatibilidad
        | con MongoDB y evitar problemas de comparación entre ObjectId
        | y cadenas.
        |
        */

        $profileIds = $userProfiles
            ->pluck('profile_id')
            ->filter()
            ->map(
                fn ($profileId) => (string) $profileId
            )
            ->unique()
            ->values()
            ->all();

        /*
        |--------------------------------------------------------------------------
        | SI NO EXISTEN IDS DE PERFIL VÁLIDOS
        |--------------------------------------------------------------------------
        */

        if (empty($profileIds)) {
            return response()->json([
                'message' =>
                    'No tienes perfiles de autorización asignados.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | OBTENER PERFILES DE AUTORIZACIÓN
        |--------------------------------------------------------------------------
        */

        $profiles = AccessProfile::query()
            ->whereIn('_id', $profileIds)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR QUE EXISTAN LOS PERFILES
        |--------------------------------------------------------------------------
        */

        if ($profiles->isEmpty()) {
            return response()->json([
                'message' =>
                    'No se encontraron los perfiles de autorización.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | RESOLVER LA SECCIÓN SOLICITADA
        |--------------------------------------------------------------------------
        |
        | El middleware acepta:
        |
        |     SEC-PRODUCTS
        |
        | o directamente el ID de la sección.
        |
        | Primero intentamos localizar la sección por código.
        |
        */

        $requestedSection = Section::query()
            ->where('code', $section)
            ->first();

        /*
        |--------------------------------------------------------------------------
        | SI NO SE ENCUENTRA POR CÓDIGO, BUSCAR POR ID
        |--------------------------------------------------------------------------
        */

        if (! $requestedSection) {
            $requestedSection = Section::query()
                ->find($section);
        }

        /*
        |--------------------------------------------------------------------------
        | SECCIÓN INEXISTENTE
        |--------------------------------------------------------------------------
        */

        if (! $requestedSection) {
            return response()->json([
                'message' =>
                    'La sección solicitada no existe.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | ID DE LA SECCIÓN SOLICITADA
        |--------------------------------------------------------------------------
        */

        $requestedSectionId =
            (string) $requestedSection->getKey();

        /*
        |--------------------------------------------------------------------------
        | COMPROBAR AUTORIZACIÓN
        |--------------------------------------------------------------------------
        |
        | Cada AccessProfile contiene:
        |
        |     section_ids
        |
        | Ejemplo:
        |
        |     [
        |         "6a8bae26880cc48ea0088872",
        |         "6a8bae26880cc48ea0088873",
        |         ...
        |     ]
        |
        | El usuario tiene permiso si al menos uno de sus perfiles
        | contiene el ID de la sección solicitada.
        |
        */

        $hasPermission = false;

        foreach ($profiles as $profile) {
            /*
            |--------------------------------------------------------------------------
            | OBTENER SECCIONES DEL PERFIL
            |--------------------------------------------------------------------------
            */

            $sectionIds =
                $profile->section_ids ?? [];

            /*
            |--------------------------------------------------------------------------
            | NORMALIZAR LOS IDS
            |--------------------------------------------------------------------------
            */

            $sectionIds = collect($sectionIds)
                ->map(
                    fn ($sectionId) => (string) $sectionId
                )
                ->filter()
                ->values()
                ->all();

            /*
            |--------------------------------------------------------------------------
            | COMPROBAR SECCIÓN
            |--------------------------------------------------------------------------
            */

            if (
                in_array(
                    $requestedSectionId,
                    $sectionIds,
                    true
                )
            ) {
                $hasPermission = true;

                break;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | DENEGAR ACCESO
        |--------------------------------------------------------------------------
        */

        if (! $hasPermission) {
            return response()->json([
                'message' =>
                    'No tienes permisos para acceder a esta sección.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | AUTORIZACIÓN CORRECTA
        |--------------------------------------------------------------------------
        */

        return $next($request);
    }
}