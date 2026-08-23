<?php

namespace App\Http\Controllers\Api;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL - USER CONTROLLER
|--------------------------------------------------------------------------
|
| Este controlador administra los usuarios del sistema.
|
| Funcionalidades:
|
| - Listar usuarios
| - Crear usuarios
| - Consultar un usuario
| - Actualizar usuarios
| - Eliminar usuarios
|
| Seguridad:
|
| - Validación de datos
| - Correo electrónico único
| - Contraseña almacenada mediante hash
| - Contraseña nunca expuesta en respuestas
| - Foto de perfil almacenada en storage público
|
| Base de datos:
|
| MongoDB
|
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Controller;
use App\Models\User;
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
     * Devuelve todos los usuarios registrados.
     *
     * La contraseña se encuentra protegida mediante el modelo
     * User y nunca se devuelve en la respuesta JSON.
     */
    public function index(): JsonResponse
    {
        $users = User::query()
            ->latest()
            ->get();

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
     * multipart/form-data
     *
     * Campos:
     *
     * name
     * email
     * phone
     * password
     * profile_photo
     *
     * El código del usuario se genera automáticamente.
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
        ]);

        /*
        |--------------------------------------------------------------------------
        | EMAIL ÚNICO
        |--------------------------------------------------------------------------
        |
        | MongoDB no utiliza aquí una migración SQL tradicional.
        | Por eso hacemos la comprobación directamente mediante
        | el modelo User.
        |
        */

        if (User::where('email', $validated['email'])->exists()) {
            return response()->json([
                'message' => 'El correo electrónico ya está registrado.',
                'errors' => [
                    'email' => [
                        'El correo electrónico ya está registrado.',
                    ],
                ],
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | GENERACIÓN DEL CÓDIGO
        |--------------------------------------------------------------------------
        |
        | El código NO viene del frontend.
        |
        | Se genera automáticamente en el backend.
        |
        | Ejemplo:
        |
        | USR-000001
        | USR-000002
        |
        */

        $lastUser = User::query()
            ->orderBy('created_at', 'desc')
            ->first();

        $nextNumber = 1;

        if ($lastUser && ! empty($lastUser->code)) {
            $lastNumber = (int) str_replace(
                'USR-',
                '',
                $lastUser->code
            );

            $nextNumber = $lastNumber + 1;
        }

        $code = 'USR-'.str_pad(
            (string) $nextNumber,
            6,
            '0',
            STR_PAD_LEFT
        );

        /*
        |--------------------------------------------------------------------------
        | FOTO DE PERFIL
        |--------------------------------------------------------------------------
        |
        | Guardamos el archivo en:
        |
        | storage/app/public/profile-photos
        |
        | El método store() genera un nombre único.
        |
        */

        $profilePhotoPath = $request
            ->file('profile_photo')
            ->store('profile-photos', 'public');

        /*
        |--------------------------------------------------------------------------
        | CREACIÓN DEL USUARIO
        |--------------------------------------------------------------------------
        */

        $user = User::create([
            'code' => $code,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'profile_photo' => $profilePhotoPath,

            /*
            |--------------------------------------------------------------------------
            | SEGURIDAD
            |--------------------------------------------------------------------------
            |
            | Nunca almacenamos la contraseña en texto plano.
            |
            */

            'password' => Hash::make(
                $validated['password']
            ),
        ]);

        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'data' => $user,
        ], 201);
    }

    /**
     * ============================================================
     * CONSULTAR USUARIO
     * ============================================================
     *
     * GET /api/users/{id}
     */
    public function show(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        return response()->json([
            'message' => 'Usuario obtenido correctamente.',
            'data' => $user,
        ], 200);
    }

    /**
     * ============================================================
     * ACTUALIZAR USUARIO
     * ============================================================
     *
     * PUT /api/users/{id}
     *
     * La contraseña es opcional durante la actualización.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

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
        ]);

        /*
        |--------------------------------------------------------------------------
        | VALIDAR EMAIL ÚNICO
        |--------------------------------------------------------------------------
        */

        $existingUser = User::where(
            'email',
            $validated['email']
        )
            ->where('_id', '!=', $user->getKey())
            ->first();

        if ($existingUser) {
            return response()->json([
                'message' => 'El correo electrónico ya está registrado.',
                'errors' => [
                    'email' => [
                        'El correo electrónico ya está registrado.',
                    ],
                ],
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | DATOS ACTUALIZABLES
        |--------------------------------------------------------------------------
        */

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'] ?? null;

        /*
        |--------------------------------------------------------------------------
        | ACTUALIZAR CONTRASEÑA
        |--------------------------------------------------------------------------
        */

        if (! empty($validated['password'])) {
            $user->password = Hash::make(
                $validated['password']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | ACTUALIZAR FOTO
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('profile_photo')) {
            /*
            | Eliminamos la fotografía anterior cuando existe.
            */

            if (! empty($user->profile_photo)) {
                Storage::disk('public')->delete(
                    $user->profile_photo
                );
            }

            $user->profile_photo = $request
                ->file('profile_photo')
                ->store('profile-photos', 'public');
        }

        $user->save();

        return response()->json([
            'message' => 'Usuario actualizado correctamente.',
            'data' => $user,
        ], 200);
    }

    /**
     * ============================================================
     * ELIMINAR USUARIO
     * ============================================================
     *
     * DELETE /api/users/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | ELIMINAR FOTO
        |--------------------------------------------------------------------------
        */

        if (! empty($user->profile_photo)) {
            Storage::disk('public')->delete(
                $user->profile_photo
            );
        }

        /*
        |--------------------------------------------------------------------------
        | ELIMINAR USUARIO
        |--------------------------------------------------------------------------
        */

        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado correctamente.',
        ], 200);
    }
}
