<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessProfile;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL - ACCESS PROFILE CONTROLLER
|--------------------------------------------------------------------------
|
| Controlador encargado de administrar los perfiles de autorización.
|
| Un perfil agrupa las secciones que un usuario puede utilizar.
|
| Ejemplo:
|
|     PRF-ADMIN
|         |
|         +-- Dashboard
|         +-- Productos
|         +-- Usuarios
|         +-- Perfiles
|
|--------------------------------------------------------------------------
*/

class AccessProfileController extends Controller
{
    /**
     * ============================================================
     * LISTAR PERFILES
     * ============================================================
     *
     * GET /api/access-profiles
     *
     * Devuelve todos los perfiles de autorización.
     */
    public function index(): JsonResponse
    {
        $profiles = AccessProfile::query()
            ->orderBy('created_at', 'desc')
            ->get();

        $profiles->transform(function (AccessProfile $profile) {
            $profile->sections = $profile->sections();

            return $profile;
        });

        return response()->json([
            'message' => 'Perfiles obtenidos correctamente.',
            'data' => $profiles,
        ], 200);
    }

    /**
     * ============================================================
     * CREAR PERFIL
     * ============================================================
     *
     * POST /api/access-profiles
     *
     * Campos:
     *
     * - name
     * - description
     * - section_ids
     *
     * El código se genera automáticamente.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'section_ids' => [
                'nullable',
                'array',
            ],

            'section_ids.*' => [
                'string',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | VALIDAR SECCIONES
        |--------------------------------------------------------------------------
        */

        $sectionIds = $validated['section_ids'] ?? [];

        if (! empty($sectionIds)) {
            $sectionsCount = Section::whereIn(
                '_id',
                $sectionIds
            )->count();

            if ($sectionsCount !== count($sectionIds)) {
                return response()->json([
                    'message' => 'Una o más secciones no existen.',
                ], 422);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | GENERAR CÓDIGO
        |--------------------------------------------------------------------------
        */

        $lastProfile = AccessProfile::query()
            ->orderBy('created_at', 'desc')
            ->first();

        $nextNumber = 1;

        if ($lastProfile && ! empty($lastProfile->code)) {
            $lastNumber = (int) str_replace(
                'PRF-',
                '',
                $lastProfile->code
            );

            $nextNumber = $lastNumber + 1;
        }

        $code = 'PRF-' . str_pad(
            (string) $nextNumber,
            6,
            '0',
            STR_PAD_LEFT
        );

        /*
        |--------------------------------------------------------------------------
        | CREAR PERFIL
        |--------------------------------------------------------------------------
        */

        $profile = AccessProfile::create([
            'code' => $code,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'section_ids' => $sectionIds,
        ]);

        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' => 'Perfil creado correctamente.',
            'data' => $profile,
            'sections' => $profile->sections(),
        ], 201);
    }

    /**
     * ============================================================
     * CONSULTAR PERFIL
     * ============================================================
     *
     * GET /api/access-profiles/{id}
     */
    public function show(string $id): JsonResponse
    {
        $profile = AccessProfile::findOrFail($id);

        return response()->json([
            'message' => 'Perfil obtenido correctamente.',
            'data' => [
                'id' => $profile->getKey(),
                'code' => $profile->code,
                'name' => $profile->name,
                'description' => $profile->description,
                'created_at' => $profile->created_at,
                'updated_at' => $profile->updated_at,
                'sections' => $profile->sections(),
            ],
        ], 200);
    }

    /**
     * ============================================================
     * ACTUALIZAR PERFIL
     * ============================================================
     *
     * PUT /api/access-profiles/{id}
     *
     * El código no puede ser modificado desde el frontend.
     */
    public function update(
        Request $request,
        string $id
    ): JsonResponse {
        $profile = AccessProfile::findOrFail($id);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'section_ids' => [
                'nullable',
                'array',
            ],

            'section_ids.*' => [
                'string',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | VALIDAR SECCIONES
        |--------------------------------------------------------------------------
        */

        $sectionIds = $validated['section_ids'] ?? [];

        if (! empty($sectionIds)) {
            $sectionsCount = Section::whereIn(
                '_id',
                $sectionIds
            )->count();

            if ($sectionsCount !== count($sectionIds)) {
                return response()->json([
                    'message' => 'Una o más secciones no existen.',
                ], 422);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | ACTUALIZAR
        |--------------------------------------------------------------------------
        */

        $profile->name = $validated['name'];

        $profile->description =
            $validated['description'] ?? null;

        $profile->section_ids = $sectionIds;

        $profile->save();

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'data' => $profile,
            'sections' => $profile->sections(),
        ], 200);
    }

    /**
     * ============================================================
     * ELIMINAR PERFIL
     * ============================================================
     *
     * DELETE /api/access-profiles/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $profile = AccessProfile::findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | ELIMINAR ASIGNACIONES
        |--------------------------------------------------------------------------
        |
        | Antes de eliminar el perfil eliminamos las relaciones
        | usuario-perfil.
        |
        */

        \App\Models\UserProfile::where(
            'profile_id',
            $profile->getKey()
        )->delete();

        /*
        |--------------------------------------------------------------------------
        | ELIMINAR PERFIL
        |--------------------------------------------------------------------------
        */

        $profile->delete();

        return response()->json([
            'message' => 'Perfil eliminado correctamente.',
        ], 200);
    }
}