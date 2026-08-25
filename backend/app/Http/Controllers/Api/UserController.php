<?php

namespace App\Http\Controllers\Api;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL - USER CONTROLLER
|--------------------------------------------------------------------------
|
| Administra los usuarios del sistema.
|
| Funcionalidades:
|
| - Listar usuarios.
| - Crear usuarios.
| - Consultar usuario.
| - Actualizar usuario.
| - Eliminar usuario.
| - Asignar perfiles de autorización.
| - Cambiar perfiles de autorización.
| - Mostrar perfiles asignados.
| - Gestionar fotografía de perfil.
|
| Relación de autorización:
|
|     User
|       ↓
|     UserProfile
|       ↓
|     AccessProfile
|       ↓
|     Section
|
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Controller;
use App\Models\AccessProfile;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * ============================================================
     * LISTAR USUARIOS
     * ============================================================
     *
     * GET /api/users
     *
     * Devuelve los usuarios junto con sus perfiles de autorización.
     */
    public function index(): JsonResponse
    {
        $users = User::query()
            ->latest()
            ->get();

        /*
        |--------------------------------------------------------------------------
        | AGREGAR PERFILES A CADA USUARIO
        |--------------------------------------------------------------------------
        */

        $users->each(function ($user) {

            $user->setAttribute(
                'profiles',
                $this->getUserProfiles($user)
            );

        });

        return response()->json([
            'message' => 'Usuarios obtenidos correctamente.',
            'data' => $users,
        ], 200);
    }


    /**
     * ============================================================
     * CREAR USUARIO
     * ============================================================
     *
     * POST /api/users
     *
     * Content-Type:
     *
     *     multipart/form-data
     *
     * Campos:
     *
     *     name
     *     email
     *     phone
     *     password
     *     profile_photo
     *     profile_ids[]
     */
    public function store(Request $request): JsonResponse
    {
        /*
        |--------------------------------------------------------------------------
        | VALIDACIÓN
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
            ],

            'phone' => [
                'nullable',
                'string',
                'regex:/^\+[1-9]\d{7,14}$/',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
            ],

            'profile_photo' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],

            /*
            |--------------------------------------------------------------------------
            | PERFILES
            |--------------------------------------------------------------------------
            |
            | El usuario debe recibir al menos un perfil.
            |
            */

            'profile_ids' => [
                'required',
                'array',
                'min:1',
            ],

            'profile_ids.*' => [
                'required',
                'string',
            ],

        ]);


        /*
        |--------------------------------------------------------------------------
        | VALIDAR QUE LOS PERFILES EXISTAN
        |--------------------------------------------------------------------------
        */

        $profileIds =
            collect(
                $validated['profile_ids']
            )
            ->map(
                fn ($id) => (string) $id
            )
            ->unique()
            ->values();


        $validProfileCount =
            AccessProfile::query()
                ->whereIn(
                    '_id',
                    $profileIds->all()
                )
                ->count();


        if (
            $validProfileCount !==
            $profileIds->count()
        ) {

            return response()->json([

                'message' =>
                    'Uno o más perfiles de autorización no existen.',

            ], 422);

        }


        /*
        |--------------------------------------------------------------------------
        | EMAIL ÚNICO
        |--------------------------------------------------------------------------
        */

        if (
            User::where(
                'email',
                $validated['email']
            )->exists()
        ) {

            return response()->json([

                'message' =>
                    'El correo electrónico ya está registrado.',

                'errors' => [

                    'email' => [

                        'El correo electrónico ya está registrado.',

                    ],

                ],

            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | GENERAR CÓDIGO
        |--------------------------------------------------------------------------
        */

        $lastUser =
            User::query()
                ->orderBy(
                    'created_at',
                    'desc'
                )
                ->first();


        $nextNumber = 1;


        if (
            $lastUser &&
            ! empty($lastUser->code)
        ) {

            $lastNumber =
                (int) str_replace(
                    'USR-',
                    '',
                    $lastUser->code
                );


            $nextNumber =
                $lastNumber + 1;
        }


        $code =
            'USR-' .
            str_pad(
                (string) $nextNumber,
                6,
                '0',
                STR_PAD_LEFT
            );


        /*
        |--------------------------------------------------------------------------
        | GUARDAR FOTO
        |--------------------------------------------------------------------------
        */

        $profilePhotoPath =
            $request
                ->file('profile_photo')
                ->store(
                    'profile-photos',
                    'public'
                );


        /*
        |--------------------------------------------------------------------------
        | CREAR USUARIO
        |--------------------------------------------------------------------------
        */

        $user =
            User::create([

                'code' =>
                    $code,

                'name' =>
                    $validated['name'],

                'email' =>
                    $validated['email'],

                'phone' =>
                    $validated['phone'] ?? null,

                'profile_photo' =>
                    $profilePhotoPath,

                'password' =>
                    Hash::make(
                        $validated['password']
                    ),

            ]);


        /*
        |--------------------------------------------------------------------------
        | ASIGNAR PERFILES
        |--------------------------------------------------------------------------
        */

        $this->syncUserProfiles(
            $user,
            $profileIds->all()
        );


        /*
        |--------------------------------------------------------------------------
        | AGREGAR PERFILES A LA RESPUESTA
        |--------------------------------------------------------------------------
        */

        $user->setAttribute(
            'profiles',
            $this->getUserProfiles($user)
        );


        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'message' =>
                'Usuario creado correctamente.',

            'data' =>
                $user,

        ], 201);
    }


    /**
     * ============================================================
     * CONSULTAR USUARIO
     * ============================================================
     *
     * GET /api/users/{id}
     */
    public function show(
        string $id
    ): JsonResponse {

        $user =
            User::findOrFail($id);


        $user->setAttribute(
            'profiles',
            $this->getUserProfiles($user)
        );


        return response()->json([

            'message' =>
                'Usuario obtenido correctamente.',

            'data' =>
                $user,

        ], 200);
    }


    /**
     * ============================================================
     * ACTUALIZAR USUARIO
     * ============================================================
     *
     * PUT /api/users/{id}
     *
     * profile_ids[] reemplaza las asignaciones anteriores.
     */
    public function update(
        Request $request,
        string $id
    ): JsonResponse {

        $user =
            User::findOrFail($id);


        /*
        |--------------------------------------------------------------------------
        | VALIDACIÓN
        |--------------------------------------------------------------------------
        */

        $validated =
            $request->validate([

                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'email' => [
                    'required',
                    'email',
                    'max:255',
                ],

                'phone' => [
                    'nullable',
                    'string',
                    'regex:/^\+[1-9]\d{7,14}$/',
                ],

                'password' => [
                    'nullable',
                    'string',
                    'min:8',
                ],

                'profile_photo' => [
                    'nullable',
                    'image',
                    'mimes:jpg,jpeg,png,webp',
                    'max:2048',
                ],

                'profile_ids' => [
                    'required',
                    'array',
                    'min:1',
                ],

                'profile_ids.*' => [
                    'required',
                    'string',
                ],

            ]);


        /*
        |--------------------------------------------------------------------------
        | PERFILES
        |--------------------------------------------------------------------------
        */

        $profileIds =
            collect(
                $validated['profile_ids']
            )
            ->map(
                fn ($profileId) =>
                    (string) $profileId
            )
            ->unique()
            ->values();


        $validProfileCount =
            AccessProfile::query()
                ->whereIn(
                    '_id',
                    $profileIds->all()
                )
                ->count();


        if (
            $validProfileCount !==
            $profileIds->count()
        ) {

            return response()->json([

                'message' =>
                    'Uno o más perfiles de autorización no existen.',

            ], 422);

        }


        /*
        |--------------------------------------------------------------------------
        | EMAIL ÚNICO
        |--------------------------------------------------------------------------
        */

        $existingUser =
            User::where(
                'email',
                $validated['email']
            )
            ->where(
                '_id',
                '!=',
                $user->getKey()
            )
            ->first();


        if ($existingUser) {

            return response()->json([

                'message' =>
                    'El correo electrónico ya está registrado.',

                'errors' => [

                    'email' => [

                        'El correo electrónico ya está registrado.',

                    ],

                ],

            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | ACTUALIZAR DATOS
        |--------------------------------------------------------------------------
        */

        $user->name =
            $validated['name'];

        $user->email =
            $validated['email'];

        $user->phone =
            $validated['phone'] ?? null;


        /*
        |--------------------------------------------------------------------------
        | ACTUALIZAR CONTRASEÑA
        |--------------------------------------------------------------------------
        */

        if (
            ! empty(
                $validated['password']
            )
        ) {

            $user->password =
                Hash::make(
                    $validated['password']
                );
        }


        /*
        |--------------------------------------------------------------------------
        | ACTUALIZAR FOTO
        |--------------------------------------------------------------------------
        */

        if (
            $request->hasFile(
                'profile_photo'
            )
        ) {

            if (
                ! empty(
                    $user->profile_photo
                )
            ) {

                Storage::disk(
                    'public'
                )->delete(
                    $user->profile_photo
                );
            }


            $user->profile_photo =
                $request
                    ->file(
                        'profile_photo'
                    )
                    ->store(
                        'profile-photos',
                        'public'
                    );
        }


        /*
        |--------------------------------------------------------------------------
        | GUARDAR USUARIO
        |--------------------------------------------------------------------------
        */

        $user->save();


        /*
        |--------------------------------------------------------------------------
        | ACTUALIZAR PERFILES
        |--------------------------------------------------------------------------
        |
        | La operación reemplaza las asignaciones anteriores.
        |
        */

        $this->syncUserProfiles(
            $user,
            $profileIds->all()
        );


        /*
        |--------------------------------------------------------------------------
        | RECARGAR PERFILES
        |--------------------------------------------------------------------------
        */

        $user->setAttribute(
            'profiles',
            $this->getUserProfiles($user)
        );


        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'message' =>
                'Usuario actualizado correctamente.',

            'data' =>
                $user,

        ], 200);
    }


    /**
     * ============================================================
     * ELIMINAR USUARIO
     * ============================================================
     *
     * DELETE /api/users/{id}
     */
    public function destroy(
        string $id
    ): JsonResponse {

        $user =
            User::findOrFail($id);


        /*
        |--------------------------------------------------------------------------
        | ELIMINAR FOTO
        |--------------------------------------------------------------------------
        */

        if (
            ! empty(
                $user->profile_photo
            )
        ) {

            Storage::disk(
                'public'
            )->delete(
                $user->profile_photo
            );
        }


        /*
        |--------------------------------------------------------------------------
        | ELIMINAR PERFILES RELACIONADOS
        |--------------------------------------------------------------------------
        */

        $user
            ->userProfiles()
            ->delete();


        /*
        |--------------------------------------------------------------------------
        | ELIMINAR USUARIO
        |--------------------------------------------------------------------------
        */

        $user->delete();


        return response()->json([

            'message' =>
                'Usuario eliminado correctamente.',

        ], 200);
    }


    /**
     * ============================================================
     * OBTENER PERFILES DEL USUARIO
     * ============================================================
     *
     * Convierte user_profiles en una estructura sencilla para
     * Angular.
     *
     * Resultado:
     *
     * [
     *     {
     *         id,
     *         code,
     *         name,
     *         description
     *     }
     * ]
     */
    private function getUserProfiles(
        User $user
    ): array {

        return $user
            ->userProfiles()
            ->with('accessProfile')
            ->get()
            ->map(
                function ($userProfile) {

                    $profile =
                        $userProfile->accessProfile;

                    if (! $profile) {

                        return null;
                    }


                    return [

                        'id' =>
                            (string)
                            $profile->getKey(),

                        'code' =>
                            $profile->code,

                        'name' =>
                            $profile->name,

                        'description' =>
                            $profile->description,

                    ];
                }
            )
            ->filter()
            ->values()
            ->all();
    }


    /**
     * ============================================================
     * SINCRONIZAR PERFILES
     * ============================================================
     *
     * Elimina las relaciones actuales y crea las nuevas.
     *
     * Esto permite:
     *
     * - Asignar perfiles al crear.
     * - Cambiar perfiles al editar.
     * - Asignar uno o varios perfiles.
     */
    private function syncUserProfiles(
        User $user,
        array $profileIds
    ): void {

        /*
        |--------------------------------------------------------------------------
        | ELIMINAR ASIGNACIONES ANTERIORES
        |--------------------------------------------------------------------------
        */

        $user
            ->userProfiles()
            ->delete();


        /*
        |--------------------------------------------------------------------------
        | CREAR NUEVAS ASIGNACIONES
        |--------------------------------------------------------------------------
        */

        foreach ($profileIds as $profileId) {

            UserProfile::create([

                'user_id' =>
                    $user->getKey(),

                'profile_id' =>
                    (string) $profileId,

            ]);
        }
    }
}