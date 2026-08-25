<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetMail;
use App\Models\PasswordResetToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL - AUTH CONTROLLER
|--------------------------------------------------------------------------
|
| Archivo:
|
|     backend/app/Http/Controllers/Api/AuthController.php
|
| Responsabilidad:
|
| - Inicio de sesión.
| - Consulta del usuario autenticado.
| - Consulta de permisos.
| - Cierre de sesión.
| - Solicitud de recuperación de contraseña.
| - Restablecimiento de contraseña.
|
| Autenticación:
|
|     Angular
|        ↓
|     AuthController
|        ↓
|     Laravel Sanctum
|        ↓
|     User
|        ↓
|     MongoDB
|
| Recuperación:
|
|     Angular
|        ↓
|     /api/forgot-password
|        ↓
|     AuthController
|        ↓
|     PasswordResetToken
|        ↓
|     MongoDB
|        ↓
|     PasswordResetMail
|        ↓
|     correo
|        ↓
|     Angular /reset-password
|        ↓
|     /api/reset-password
|
|--------------------------------------------------------------------------
*/

class AuthController extends Controller
{
    /**
     * ============================================================
     * INICIAR SESIÓN
     * ============================================================
     *
     * POST /api/login
     *
     * Ruta pública.
     *
     * Valida las credenciales y genera un token Sanctum.
     */
    public function login(Request $request): JsonResponse
    {
        /*
        |--------------------------------------------------------------------------
        | VALIDACIÓN
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
            ],

            'password' => [
                'required',
                'string',
            ],

            'device_name' => [
                'nullable',
                'string',
                'max:100',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | BUSCAR USUARIO
        |--------------------------------------------------------------------------
        */

        $user = User::where(
            'email',
            $validated['email']
        )->first();


        /*
        |--------------------------------------------------------------------------
        | VALIDAR CREDENCIALES
        |--------------------------------------------------------------------------
        */

        if (
            ! $user ||
            ! Hash::check(
                $validated['password'],
                $user->password
            )
        ) {
            throw ValidationException::withMessages([
                'email' => [
                    'Las credenciales proporcionadas no son válidas.',
                ],
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | NOMBRE DEL DISPOSITIVO
        |--------------------------------------------------------------------------
        */

        $deviceName = $validated['device_name']
            ?? 'TAP Terminal Web';


        /*
        |--------------------------------------------------------------------------
        | CREAR TOKEN SANCTUM
        |--------------------------------------------------------------------------
        */

        $token = $user->createToken(
            $deviceName
        )->plainTextToken;


        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' => 'Inicio de sesión correcto.',

            'data' => [
                'user' => $user,

                'token' => $token,

                'token_type' => 'Bearer',
            ],
        ], 200);
    }


    /**
     * ============================================================
     * SOLICITAR RECUPERACIÓN DE CONTRASEÑA
     * ============================================================
     *
     * POST /api/forgot-password
     *
     * Ruta pública.
     *
     * Recibe:
     *
     *     email
     *
     * Genera un token de recuperación y envía un correo.
     *
     * IMPORTANTE:
     *
     * La respuesta no revela si el correo existe o no.
     *
     * Esto evita revelar qué cuentas están registradas
     * en el sistema.
     */
    public function forgotPassword(
        Request $request
    ): JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | VALIDACIÓN
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | NORMALIZAR CORREO
        |--------------------------------------------------------------------------
        */

        $email =
            Str::lower(
                trim(
                    $validated['email']
                )
            );


        /*
        |--------------------------------------------------------------------------
        | BUSCAR USUARIO
        |--------------------------------------------------------------------------
        */

        $user = User::where(
            'email',
            $email
        )->first();


        /*
        |--------------------------------------------------------------------------
        | RESPUESTA GENÉRICA
        |--------------------------------------------------------------------------
        |
        | No informamos al cliente si el correo existe.
        |
        */

        $genericResponse = function (): JsonResponse {

            return response()->json([
                'message' =>
                    'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.',
            ], 200);
        };


        /*
        |--------------------------------------------------------------------------
        | USUARIO NO EXISTE
        |--------------------------------------------------------------------------
        */

        if (! $user) {

            return $genericResponse();

        }


        /*
        |--------------------------------------------------------------------------
        | ELIMINAR TOKENS ANTERIORES
        |--------------------------------------------------------------------------
        |
        | Solamente mantenemos vigente el último proceso
        | de recuperación solicitado para ese correo.
        |
        */

        PasswordResetToken::where(
            'email',
            $email
        )->delete();


        /*
        |--------------------------------------------------------------------------
        | GENERAR TOKEN
        |--------------------------------------------------------------------------
        |
        | random() genera un token criptográficamente seguro.
        |
        | El token que viaja por correo no se guarda directamente
        | en MongoDB.
        |--------------------------------------------------------------------------
        */

        $plainToken =
            Str::random(64);


        /*
        |--------------------------------------------------------------------------
        | GUARDAR TOKEN
        |--------------------------------------------------------------------------
        |
        | Se almacena únicamente el hash del token.
        |
        | Si alguien obtiene acceso a la colección,
        | no podrá utilizar directamente el valor almacenado.
        |
        */

        PasswordResetToken::create([

            'email' =>
                $email,

            'token' =>
                hash(
                    'sha256',
                    $plainToken
                ),

            'created_at' =>
                now(),

        ]);


        /*
        |--------------------------------------------------------------------------
        | CONSTRUIR URL DE ANGULAR
        |--------------------------------------------------------------------------
        |
        | El frontend será responsable de mostrar la pantalla:
        |
        |     /reset-password
        |
        | El token se envía como parámetro de consulta.
        |
        | Ejemplo:
        |
        |     http://localhost:4200/reset-password?token=...
        |
        */

        $frontendUrl =
            rtrim(
                env(
                    'FRONTEND_URL',
                    'http://localhost:4200'
                ),
                '/'
            );


        $resetUrl =
            $frontendUrl .
            '/reset-password?token=' .
            urlencode(
                $plainToken
            ) .
            '&email=' .
            urlencode(
                $email
            );


        /*
        |--------------------------------------------------------------------------
        | ENVIAR CORREO
        |--------------------------------------------------------------------------
        */

        Mail::to(
            $email
        )->send(
            new PasswordResetMail(
                $email,
                $plainToken,
                $resetUrl
            )
        );


        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        */

        return $genericResponse();
    }


    /**
     * ============================================================
     * RESTABLECER CONTRASEÑA
     * ============================================================
     *
     * POST /api/reset-password
     *
     * Ruta pública.
     *
     * Recibe:
     *
     *     email
     *     token
     *     password
     *     password_confirmation
     *
     * El token debe:
     *
     * - existir;
     * - corresponder al correo;
     * - no haber expirado;
     * - coincidir con el hash almacenado.
     */
    public function resetPassword(
        Request $request
    ): JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | VALIDACIÓN
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([

            'email' => [
                'required',
                'email',
                'max:255',
            ],

            'token' => [
                'required',
                'string',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],

        ]);


        /*
        |--------------------------------------------------------------------------
        | NORMALIZAR CORREO
        |--------------------------------------------------------------------------
        */

        $email =
            Str::lower(
                trim(
                    $validated['email']
                )
            );


        /*
        |--------------------------------------------------------------------------
        | BUSCAR TOKEN
        |--------------------------------------------------------------------------
        */

        $resetToken =
            PasswordResetToken::where(
                'email',
                $email
            )
            ->first();


        /*
        |--------------------------------------------------------------------------
        | VALIDAR EXISTENCIA
        |--------------------------------------------------------------------------
        */

        if (! $resetToken) {

            return response()->json([
                'message' =>
                    'El enlace de recuperación no es válido o ha expirado.',
            ], 422);

        }


        /*
        |--------------------------------------------------------------------------
        | VALIDAR EXPIRACIÓN
        |--------------------------------------------------------------------------
        |
        | Los tokens son válidos durante 60 minutos.
        |--------------------------------------------------------------------------
        */

        $createdAt =
            $resetToken->created_at;


        if (
            ! $createdAt ||
            $createdAt->lt(
                now()->subMinutes(60)
            )
        ) {

            $resetToken->delete();

            return response()->json([
                'message' =>
                    'El enlace de recuperación no es válido o ha expirado.',
            ], 422);

        }


        /*
        |--------------------------------------------------------------------------
        | VALIDAR TOKEN
        |--------------------------------------------------------------------------
        */

        $tokenHash =
            hash(
                'sha256',
                $validated['token']
            );


        if (
            ! hash_equals(
                (string) $resetToken->token,
                $tokenHash
            )
        ) {

            return response()->json([
                'message' =>
                    'El enlace de recuperación no es válido o ha expirado.',
            ], 422);

        }


        /*
        |--------------------------------------------------------------------------
        | BUSCAR USUARIO
        |--------------------------------------------------------------------------
        */

        $user =
            User::where(
                'email',
                $email
            )->first();


        if (! $user) {

            return response()->json([
                'message' =>
                    'El enlace de recuperación no es válido o ha expirado.',
            ], 422);

        }


        /*
        |--------------------------------------------------------------------------
        | ACTUALIZAR CONTRASEÑA
        |--------------------------------------------------------------------------
        */

        $user->password =
            Hash::make(
                $validated['password']
            );


        $user->save();


        /*
        |--------------------------------------------------------------------------
        | ELIMINAR TOKEN UTILIZADO
        |--------------------------------------------------------------------------
        |
        | El token solamente puede utilizarse una vez.
        |
        */

        $resetToken->delete();


        /*
        |--------------------------------------------------------------------------
        | REVOCAR TOKENS SANCTUM
        |--------------------------------------------------------------------------
        |
        | Si el usuario tenía sesiones activas,
        | las revocamos para obligarlo a iniciar sesión
        | nuevamente con la nueva contraseña.
        |
        */

        $user->tokens()->delete();


        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' =>
                'La contraseña fue restablecida correctamente.',
        ], 200);
    }


    /**
     * ============================================================
     * USUARIO AUTENTICADO Y SUS PERMISOS
     * ============================================================
     *
     * GET /api/me
     *
     * Requiere:
     *
     *     Authorization: Bearer TOKEN
     *
     * Middleware:
     *
     *     auth:sanctum
     */
    public function me(
        Request $request
    ): JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | USUARIO AUTENTICADO
        |--------------------------------------------------------------------------
        */

        $user =
            $request->user();


        /*
        |--------------------------------------------------------------------------
        | OBTENER ASIGNACIONES
        |--------------------------------------------------------------------------
        */

        $userProfiles =
            $user
                ->userProfiles()
                ->get();


        /*
        |--------------------------------------------------------------------------
        | OBTENER PERFILES DE AUTORIZACIÓN
        |--------------------------------------------------------------------------
        */

        $accessProfiles =
            $userProfiles
                ->map(
                    function ($userProfile) {

                        return $userProfile
                            ->accessProfile;

                    }
                )
                ->filter()
                ->values();


        /*
        |--------------------------------------------------------------------------
        | OBTENER SECCIONES
        |--------------------------------------------------------------------------
        */

        $sections =
            $accessProfiles
                ->flatMap(
                    function ($accessProfile) {

                        return $accessProfile
                            ->sections();

                    }
                )
                ->unique(
                    fn ($section) =>
                        (string) $section->getKey()
                )
                ->values();


        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'message' =>
                'Usuario autenticado correctamente.',

            'data' => [

                'user' =>
                    $user,

                'access_profiles' =>
                    $accessProfiles
                        ->map(
                            function ($profile) {

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
                        ->values(),

                'sections' =>
                    $sections
                        ->map(
                            function ($section) {

                                return [

                                    'id' =>
                                        (string)
                                        $section->getKey(),

                                    'code' =>
                                        $section->code,

                                    'name' =>
                                        $section->name,

                                    'description' =>
                                        $section->description,

                                    'route' =>
                                        $section->route,

                                ];

                            }
                        )
                        ->values(),

            ],

        ], 200);
    }


    /**
     * ============================================================
     * CERRAR SESIÓN
     * ============================================================
     *
     * POST /api/logout
     *
     * Revoca únicamente el token utilizado en la petición actual.
     */
    public function logout(
        Request $request
    ): JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | OBTENER TOKEN ACTUAL
        |--------------------------------------------------------------------------
        */

        $token =
            $request
                ->user()
                ->currentAccessToken();


        /*
        |--------------------------------------------------------------------------
        | REVOCAR TOKEN
        |--------------------------------------------------------------------------
        */

        if ($token) {

            $token->delete();

        }


        /*
        |--------------------------------------------------------------------------
        | LIMPIAR USUARIO DEL GUARD
        |--------------------------------------------------------------------------
        */

        Auth::guard(
            'sanctum'
        )->forgetUser();


        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' =>
                'Sesión cerrada correctamente.',
        ], 200);
    }
}