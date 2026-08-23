<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL - AUTH CONTROLLER
|--------------------------------------------------------------------------
|
| Controlador responsable de la autenticación de usuarios mediante
| Laravel Sanctum.
|
| Funcionalidades:
|
| - Inicio de sesión.
| - Consulta del usuario autenticado.
| - Cierre de sesión.
|
| Arquitectura:
|
| Angular
|    ↓
| HTTP Request
|    ↓
| AuthController
|    ↓
| Laravel Sanctum
|    ↓
| User / PersonalAccessToken
|    ↓
| MongoDB
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
     * Datos recibidos:
     *
     * - email
     * - password
     * - device_name (opcional)
     *
     * Devuelve un token Bearer generado por Laravel Sanctum.
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
        |
        | El correo electrónico identifica al usuario durante el login.
        |
        */

        $user = User::where(
            'email',
            $validated['email']
        )->first();

        /*
        |--------------------------------------------------------------------------
        | VALIDAR CREDENCIALES
        |--------------------------------------------------------------------------
        |
        | No indicamos si el correo o la contraseña fueron incorrectos
        | por separado.
        |
        | Esto evita revelar información sobre usuarios registrados.
        |
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
        | CREAR TOKEN
        |--------------------------------------------------------------------------
        |
        | Sanctum genera un Personal Access Token.
        |
        | El token en texto plano solamente se devuelve en esta respuesta.
        |
        */

        $token = $user->createToken(
            $deviceName
        )->plainTextToken;

        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        |
        | User::$hidden evita que password y remember_token
        | sean incluidos en la respuesta JSON.
        |
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
     * USUARIO AUTENTICADO
     * ============================================================
     *
     * GET /api/me
     *
     * Requiere:
     *
     * Authorization: Bearer TOKEN
     *
     * Middleware:
     *
     * auth:sanctum
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Usuario autenticado correctamente.',
            'data' => $request->user(),
        ], 200);
    }

    /**
     * ============================================================
     * CERRAR SESIÓN
     * ============================================================
     *
     * POST /api/logout
     *
     * Requiere:
     *
     * Authorization: Bearer TOKEN
     *
     * Revoca únicamente el token utilizado en la petición actual.
     *
     * Esto permite que otras sesiones/dispositivos del usuario
     * permanezcan activos.
     */
    public function logout(Request $request): JsonResponse
    {
        /*
        |--------------------------------------------------------------------------
        | OBTENER TOKEN ACTUAL
        |--------------------------------------------------------------------------
        |
        | Sanctum proporciona el token utilizado para autenticar
        | la petición actual.
        |
        */

        $token = $request->user()->currentAccessToken();

        /*
        |--------------------------------------------------------------------------
        | REVOCAR TOKEN
        |--------------------------------------------------------------------------
        |
        | La forma oficial de revocar el token actual en Sanctum
        | es eliminarlo de la base de datos.
        |
        */

        if ($token) {
            $token->delete();
        }

        /*
        |--------------------------------------------------------------------------
        | LIMPIAR USUARIO DEL GUARD
        |--------------------------------------------------------------------------
        |
        | RequestGuard conserva internamente el usuario autenticado.
        |
        | Durante pruebas y determinados escenarios donde varias
        | peticiones utilizan la misma instancia de aplicación,
        | eliminar el token no limpia automáticamente ese usuario
        | que ya había sido resuelto.
        |
        | forgetUser() obliga al guard a olvidar el usuario actual.
        |
        | En la siguiente petición, Sanctum deberá validar nuevamente
        | el Bearer Token contra MongoDB.
        |
        */

        Auth::guard('sanctum')->forgetUser();

        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ], 200);
    }
}
