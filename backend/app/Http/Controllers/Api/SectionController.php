<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL - SECTION CONTROLLER
|--------------------------------------------------------------------------
|
| Controlador encargado de administrar las secciones funcionales
| disponibles dentro del sistema TAP Terminal.
|
| Una sección representa una funcionalidad a la que un usuario
| puede tener acceso mediante un AccessProfile.
|
| Ejemplos:
|
|     SEC-DASHBOARD
|     SEC-PRODUCTS
|     SEC-USERS
|     SEC-PROFILES
|
|--------------------------------------------------------------------------
*/

class SectionController extends Controller
{
    /**
     * ============================================================
     * LISTAR SECCIONES
     * ============================================================
     *
     * GET /api/sections
     *
     * Devuelve todas las secciones registradas.
     */
    public function index(): JsonResponse
    {
        $sections = Section::query()
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'message' => 'Secciones obtenidas correctamente.',
            'data' => $sections,
        ], 200);
    }

    /**
     * ============================================================
     * CREAR SECCIÓN
     * ============================================================
     *
     * POST /api/sections
     *
     * Campos:
     *
     * - code
     * - name
     * - description
     * - route
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

            'route' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | GENERAR CÓDIGO
        |--------------------------------------------------------------------------
        |
        | Ejemplo:
        |
        |     SEC-000001
        |     SEC-000002
        |
        */

        $lastSection = Section::query()
            ->orderBy('created_at', 'desc')
            ->first();

        $nextNumber = 1;

        if ($lastSection && ! empty($lastSection->code)) {
            $lastNumber = (int) str_replace(
                'SEC-',
                '',
                $lastSection->code
            );

            $nextNumber = $lastNumber + 1;
        }

        $code = 'SEC-' . str_pad(
            (string) $nextNumber,
            6,
            '0',
            STR_PAD_LEFT
        );

        /*
        |--------------------------------------------------------------------------
        | VALIDAR RUTA ÚNICA
        |--------------------------------------------------------------------------
        */

        if (
            Section::where(
                'route',
                $validated['route']
            )->exists()
        ) {
            return response()->json([
                'message' => 'La ruta ya está registrada.',
                'errors' => [
                    'route' => [
                        'La ruta ya está registrada.',
                    ],
                ],
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | CREAR SECCIÓN
        |--------------------------------------------------------------------------
        */

        $section = Section::create([
            'code' => $code,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'route' => $validated['route'],
        ]);

        return response()->json([
            'message' => 'Sección creada correctamente.',
            'data' => $section,
        ], 201);
    }

    /**
     * ============================================================
     * CONSULTAR SECCIÓN
     * ============================================================
     *
     * GET /api/sections/{id}
     */
    public function show(string $id): JsonResponse
    {
        $section = Section::findOrFail($id);

        return response()->json([
            'message' => 'Sección obtenida correctamente.',
            'data' => $section,
        ], 200);
    }

    /**
     * ============================================================
     * ACTUALIZAR SECCIÓN
     * ============================================================
     *
     * PUT /api/sections/{id}
     *
     * El código no se modifica.
     */
    public function update(
        Request $request,
        string $id
    ): JsonResponse {
        $section = Section::findOrFail($id);

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

            'route' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | VALIDAR RUTA ÚNICA
        |--------------------------------------------------------------------------
        */

        $existingSection = Section::where(
            'route',
            $validated['route']
        )
            ->where(
                '_id',
                '!=',
                $section->getKey()
            )
            ->first();

        if ($existingSection) {
            return response()->json([
                'message' => 'La ruta ya está registrada.',
                'errors' => [
                    'route' => [
                        'La ruta ya está registrada.',
                    ],
                ],
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | ACTUALIZAR
        |--------------------------------------------------------------------------
        */

        $section->name = $validated['name'];

        $section->description =
            $validated['description'] ?? null;

        $section->route = $validated['route'];

        $section->save();

        return response()->json([
            'message' => 'Sección actualizada correctamente.',
            'data' => $section,
        ], 200);
    }

    /**
     * ============================================================
     * ELIMINAR SECCIÓN
     * ============================================================
     *
     * DELETE /api/sections/{id}
     *
     * Antes de eliminar la sección se retira de los perfiles
     * que la tengan asignada.
     */
    public function destroy(string $id): JsonResponse
    {
        $section = Section::findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | RETIRAR SECCIÓN DE LOS PERFILES
        |--------------------------------------------------------------------------
        |
        | AccessProfile almacena los IDs de las secciones
        | dentro del campo section_ids.
        |
        */

        $profiles = \App\Models\AccessProfile::query()
            ->where(
                'section_ids',
                'exists',
                true
            )
            ->get();

        foreach ($profiles as $profile) {
            $sectionIds = $profile->section_ids ?? [];

            $sectionIds = array_values(
                array_filter(
                    $sectionIds,
                    fn ($sectionId) =>
                        (string) $sectionId !==
                        (string) $section->getKey()
                )
            );

            $profile->section_ids = $sectionIds;

            $profile->save();
        }

        /*
        |--------------------------------------------------------------------------
        | ELIMINAR SECCIÓN
        |--------------------------------------------------------------------------
        */

        $section->delete();

        return response()->json([
            'message' => 'Sección eliminada correctamente.',
        ], 200);
    }
}