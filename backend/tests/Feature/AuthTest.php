<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL - AUTH TEST
|--------------------------------------------------------------------------
|
| Pruebas funcionales de autenticación.
|
| Se comprueba:
|
| - Inicio de sesión correcto.
| - Rechazo de credenciales incorrectas.
| - Protección de /api/me.
| - Consulta del usuario autenticado.
| - Cierre de sesión.
| - Revocación del token.
|
|--------------------------------------------------------------------------
*/

class AuthTest extends TestCase
{
    /**
     * ============================================================
     * PREPARAR ENTORNO DE PRUEBA
     * ============================================================
     *
     * Cada prueba debe comenzar con un estado limpio.
     *
     * Esto evita que un usuario o token creado por una prueba
     * interfiera con otra.
     */
    protected function setUp(): void
    {
        parent::setUp();

        /*
        |--------------------------------------------------------------------------
        | LIMPIAR USUARIOS
        |--------------------------------------------------------------------------
        */

        User::query()->delete();

        /*
        |--------------------------------------------------------------------------
        | LIMPIAR TOKENS
        |--------------------------------------------------------------------------
        |
        | Eliminamos directamente los documentos de la colección
        | de tokens de Sanctum.
        |
        */

        DB::connection('mongodb')
            ->getDatabase()
            ->getCollection('personal_access_tokens')
            ->deleteMany([]);
    }

    /**
     * ============================================================
     * CREAR USUARIO DE PRUEBA
     * ============================================================
     */
    private function createUser(): User
    {
        return User::create([
            'code' => 'USR-'.fake()->unique()->numerify('######'),
            'name' => 'Usuario Auth Test',
            'email' => fake()->unique()->safeEmail(),
            'phone' => '+523141234567',
            'password' => Hash::make('Password123!'),
        ]);
    }

    /**
     * ============================================================
     * LOGIN CORRECTO
     * ============================================================
     */
    public function test_user_can_login(): void
    {
        $user = $this->createUser();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'Password123!',
            'device_name' => 'TAP Terminal Test',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Inicio de sesión correcto.'
            )
            ->assertJsonPath(
                'data.user.email',
                $user->email
            )
            ->assertJsonPath(
                'data.user.name',
                'Usuario Auth Test'
            )
            ->assertJsonPath(
                'data.token_type',
                'Bearer'
            )
            ->assertJsonStructure([
                'message',
                'data' => [
                    'user',
                    'token',
                    'token_type',
                ],
            ]);

        /*
        |--------------------------------------------------------------------------
        | LA CONTRASEÑA NO DEBE APARECER
        |--------------------------------------------------------------------------
        */

        $response->assertJsonMissing([
            'password' => 'Password123!',
        ]);

        /*
        |--------------------------------------------------------------------------
        | DEBE EXISTIR EXACTAMENTE UN TOKEN
        |--------------------------------------------------------------------------
        */

        $tokenCount = DB::connection('mongodb')
            ->getDatabase()
            ->getCollection('personal_access_tokens')
            ->countDocuments();

        $this->assertSame(1, $tokenCount);
    }

    /**
     * ============================================================
     * LOGIN CON CONTRASEÑA INCORRECTA
     * ============================================================
     */
    public function test_user_cannot_login_with_invalid_password(): void
    {
        $user = $this->createUser();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'PasswordIncorrecta!',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'email',
            ]);
    }

    /**
     * ============================================================
     * /api/me REQUIERE AUTENTICACIÓN
     * ============================================================
     */
    public function test_me_requires_authentication(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertUnauthorized();
    }

    /**
     * ============================================================
     * USUARIO AUTENTICADO PUEDE CONSULTAR /api/me
     * ============================================================
     */
    public function test_authenticated_user_can_view_me(): void
    {
        $user = $this->createUser();

        $login = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'Password123!',
        ]);

        $token = $login->json('data.token');

        $response = $this->withToken($token)
            ->getJson('/api/me');

        $response
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Usuario autenticado correctamente.'
            )
            ->assertJsonPath(
                'data.email',
                $user->email
            )
            ->assertJsonPath(
                'data.name',
                'Usuario Auth Test'
            );

        $response->assertJsonMissing([
            'password' => 'Password123!',
        ]);
    }

    /**
     * ============================================================
     * LOGOUT
     * ============================================================
     *
     * Comprueba:
     *
     * 1. El token funciona antes del logout.
     * 2. El logout responde correctamente.
     * 3. El token deja de existir en MongoDB.
     * 4. El mismo token ya no puede acceder a /api/me.
     */
    public function test_user_can_logout(): void
    {
        $user = $this->createUser();

        /*
        |--------------------------------------------------------------------------
        | LOGIN
        |--------------------------------------------------------------------------
        */

        $login = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'Password123!',
        ]);

        $token = $login->json('data.token');

        /*
        |--------------------------------------------------------------------------
        | COMPROBAR TOKEN
        |--------------------------------------------------------------------------
        |
        | Antes del logout debe existir un token.
        |
        */

        $this->assertSame(
            1,
            DB::connection('mongodb')
                ->getDatabase()
                ->getCollection('personal_access_tokens')
                ->countDocuments()
        );

        /*
        |--------------------------------------------------------------------------
        | LOGOUT
        |--------------------------------------------------------------------------
        */

        $logout = $this->withToken($token)
            ->postJson('/api/logout');

        $logout
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Sesión cerrada correctamente.'
            );

        /*
        |--------------------------------------------------------------------------
        | COMPROBAR REVOCACIÓN EN MONGODB
        |--------------------------------------------------------------------------
        |
        | Después del logout ya no debe existir ningún token.
        |
        */

        $this->assertSame(
            0,
            DB::connection('mongodb')
                ->getDatabase()
                ->getCollection('personal_access_tokens')
                ->countDocuments()
        );

        /*
        |--------------------------------------------------------------------------
        | COMPROBAR QUE EL TOKEN YA NO FUNCIONA
        |--------------------------------------------------------------------------
        */

        $response = $this->withToken($token)
            ->getJson('/api/me');

        $response->assertUnauthorized();
    }
}
