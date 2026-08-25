<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * ============================================================
 * TAP TERMINAL
 * USER FEATURE TESTS
 * ============================================================
 *
 * Archivo:
 * tests/Feature/UserTest.php
 *
 * Tipo:
 * Backend - Laravel / PHPUnit
 *
 * Responsabilidad:
 *
 * Verificar el funcionamiento de la API REST de usuarios.
 *
 * Funcionalidades comprobadas:
 *
 * 1. Crear usuario.
 * 2. Listar usuarios.
 * 3. Consultar usuario.
 * 4. Actualizar usuario.
 * 5. Eliminar usuario.
 * 6. Rechazar correo duplicado.
 * 7. Verificar hash de contraseña.
 * 8. Verificar que password no se exponga.
 *
 * Autenticación:
 *
 * Laravel Sanctum
 *
 * Base de datos:
 *
 * MongoDB
 *
 * ============================================================
 */
class UserTest extends TestCase
{
    /**
     * ========================================================
     * PREPARAR CADA PRUEBA
     * ========================================================
     *
     * Antes de cada prueba:
     *
     * - Eliminamos usuarios.
     * - Eliminamos tokens de Sanctum.
     * - Eliminamos fotografías anteriores.
     *
     * Esto garantiza que cada prueba comience desde
     * un estado limpio.
     *
     * ========================================================
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
        | LIMPIAR TOKENS DE SANCTUM
        |--------------------------------------------------------------------------
        |
        | Los tokens se almacenan en la colección:
        |
        |     personal_access_tokens
        |
        */

        DB::connection('mongodb')
            ->getDatabase()
            ->getCollection('personal_access_tokens')
            ->deleteMany([]);

        /*
        |--------------------------------------------------------------------------
        | LIMPIAR FOTOGRAFÍAS
        |--------------------------------------------------------------------------
        */

        Storage::disk('public')
            ->deleteDirectory('profile-photos');
    }


    /**
     * ========================================================
     * LIMPIAR DESPUÉS DE CADA PRUEBA
     * ========================================================
     *
     * Eliminamos los datos generados por la prueba.
     *
     * ========================================================
     */
    protected function tearDown(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ELIMINAR USUARIOS
        |--------------------------------------------------------------------------
        */

        User::query()->delete();

        /*
        |--------------------------------------------------------------------------
        | ELIMINAR TOKENS
        |--------------------------------------------------------------------------
        */

        DB::connection('mongodb')
            ->getDatabase()
            ->getCollection('personal_access_tokens')
            ->deleteMany([]);

        /*
        |--------------------------------------------------------------------------
        | ELIMINAR FOTOGRAFÍAS
        |--------------------------------------------------------------------------
        */

        Storage::disk('public')
            ->deleteDirectory('profile-photos');

        parent::tearDown();
    }


    /**
     * ========================================================
     * AUTENTICAR USUARIO PARA LAS PRUEBAS
     * ========================================================
     *
     * Crea un usuario de prueba y utiliza el endpoint real
     * de login.
     *
     * Flujo:
     *
     * User
     *   ↓
     * POST /api/login
     *   ↓
     * AuthController
     *   ↓
     * Sanctum
     *   ↓
     * Bearer Token
     *
     * De esta manera las pruebas de usuarios utilizan
     * exactamente el mismo mecanismo de autenticación
     * que utilizará Angular.
     *
     * @return string Token de autenticación.
     * ========================================================
     */
private function authenticate(): string
    {
        /*
        |--------------------------------------------------------------------------
        | CREAR USUARIO PARA AUTENTICACIÓN
        |--------------------------------------------------------------------------
        */

        $user = User::create([
            'code' => 'USR-'.fake()->unique()->numerify('######'),

            'name' => 'Usuario User Test',

            'email' => fake()->unique()->safeEmail(),

            'phone' => '+523141234567',

            'password' => Hash::make(
                'Password123!'
            ),
        ]);

        /*
        |--------------------------------------------------------------------------
        | OTORGAR PERMISOS DE SECCIÓN (SEC-USERS)
        |--------------------------------------------------------------------------
        |
        | Igual que en ProductTest: el middleware CheckSectionPermission
        | exige un AccessProfile con la sección correspondiente.
        |
        */

        $section = \App\Models\Section::firstOrCreate(
            ['code' => 'SEC-USERS'],
            [
                'name' => 'Usuarios',
                'description' => 'Acceso al módulo de usuarios',
                'route' => '/users',
            ]
        );

        $accessProfile = \App\Models\AccessProfile::firstOrCreate(
            ['code' => 'PRF-TEST-USERS'],
            [
                'name' => 'Perfil de prueba - Usuarios',
                'description' => 'Perfil generado automáticamente para pruebas automatizadas',
                'section_ids' => [(string) $section->getKey()],
            ]
        );

        \App\Models\UserProfile::create([
            'user_id' => $user->getKey(),
            'profile_id' => (string) $accessProfile->getKey(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | REALIZAR LOGIN REAL
        |--------------------------------------------------------------------------
        |
        | No utilizamos actingAs().
        |
        | Utilizamos el endpoint real de la aplicación para
        | comprobar también que Sanctum funciona.
        |
        */

        $response = $this->postJson(
            '/api/login',
            [
                'email' => $user->email,

                'password' => 'Password123!',

                'device_name' => 'TAP Terminal User Test',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR LOGIN
        |--------------------------------------------------------------------------
        */

        $response->assertOk();

        /*
        |--------------------------------------------------------------------------
        | OBTENER TOKEN
        |--------------------------------------------------------------------------
        */

        $token = $response->json(
            'data.token'
        );

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR QUE EXISTE TOKEN
        |--------------------------------------------------------------------------
        */

        $this->assertNotEmpty($token);

        /*
        |--------------------------------------------------------------------------
        | DEVOLVER TOKEN
        |--------------------------------------------------------------------------
        */

        return $token;
    }

    /**
     * ========================================================
     * TEST 1 - CREAR USUARIO
     * ========================================================
     *
     * Endpoint:
     *
     *     POST /api/users
     *
     * Comprueba:
     *
     * - Autenticación.
     * - HTTP 201.
     * - Creación correcta.
     * - Código automático.
     * - Datos principales.
     * - Password oculto.
     *
     * ========================================================
     */
    public function test_can_create_user(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AUTENTICACIÓN
        |--------------------------------------------------------------------------
        */

        $token = $this->authenticate();


        /*
        |--------------------------------------------------------------------------
        | ALMACENAMIENTO FALSO
        |--------------------------------------------------------------------------
        |
        | No escribimos fotografías reales.
        |
        */

        Storage::fake('public');


        /*
        |--------------------------------------------------------------------------
        | CREAR USUARIO
        |--------------------------------------------------------------------------
        |
        | No enviamos "code".
        |
        | El controlador genera:
        |
        |     USR-000002
        |
        | porque authenticate() creó previamente
        | USR-xxxxxx.
        |
        | NOTA:
        |
        | El código del usuario creado por la API depende
        | del último usuario existente.
        |
        */

 $accessProfile = \App\Models\AccessProfile::where(
            'code',
            'PRF-TEST-USERS'
        )->firstOrFail();

        $response = $this->withToken($token)
            ->postJson(
                '/api/users',
                [
                    'name' => 'Usuario Test',
                    'email' => 'test@example.com',
                    'phone' => '+523141234567',
                    'password' => 'Password123!',
                    'profile_photo' => UploadedFile::fake()->image(
                        'profile.jpg'
                    ),
                    'profile_ids' => [
                        (string) $accessProfile->getKey(),
                    ],
                ]
            );

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR HTTP 201
        |--------------------------------------------------------------------------
        */

        $response->assertStatus(201);


        /*
        |--------------------------------------------------------------------------
        | VERIFICAR MENSAJE
        |--------------------------------------------------------------------------
        */

        $response->assertJsonPath(
            'message',
            'Usuario creado correctamente.'
        );


        /*
        |--------------------------------------------------------------------------
        | VERIFICAR DATOS
        |--------------------------------------------------------------------------
        */

        $response
            ->assertJsonPath(
                'data.name',
                'Usuario Test'
            )
            ->assertJsonPath(
                'data.email',
                'test@example.com'
            );


        /*
        |--------------------------------------------------------------------------
        | VERIFICAR CÓDIGO
        |--------------------------------------------------------------------------
        |
        | El código debe comenzar con USR-.
        |
        | No comprobamos un número fijo porque el usuario
        | de autenticación ya ocupa el primer registro.
        |
        */

        $this->assertStringStartsWith(
            'USR-',
            $response->json('data.code')
        );


        /*
        |--------------------------------------------------------------------------
        | VERIFICAR PASSWORD
        |--------------------------------------------------------------------------
        */

        $response->assertJsonMissingPath(
            'data.password'
        );


        /*
        |--------------------------------------------------------------------------
        | VERIFICAR MONGODB
        |--------------------------------------------------------------------------
        */

        $this->assertDatabaseHas(
            'users',
            [
                'email' => 'test@example.com',
            ]
        );
    }


    /**
     * ========================================================
     * TEST 2 - LISTAR USUARIOS
     * ========================================================
     *
     * Endpoint:
     *
     *     GET /api/users
     *
     * ========================================================
     */
    public function test_can_list_users(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AUTENTICACIÓN
        |--------------------------------------------------------------------------
        */

        $token = $this->authenticate();


        /*
        |--------------------------------------------------------------------------
        | CREAR USUARIO DE PRUEBA
        |--------------------------------------------------------------------------
        */

        User::create([
            'code' => 'USR-000002',

            'name' => 'Usuario Lista',

            'email' => 'lista@example.com',

            'password' => Hash::make(
                'Password123!'
            ),
        ]);


        /*
        |--------------------------------------------------------------------------
        | CONSULTAR API
        |--------------------------------------------------------------------------
        */

        $response = $this->withToken($token)
            ->getJson(
                '/api/users'
            );


        /*
        |--------------------------------------------------------------------------
        | VERIFICAR RESPUESTA
        |--------------------------------------------------------------------------
        |
        | Existen dos usuarios:
        |
        | 1. Usuario de autenticación.
        | 2. Usuario de prueba.
        |
        */

        $response
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Usuarios obtenidos correctamente.'
            )
            ->assertJsonCount(
                2,
                'data'
            );
    }


    /**
     * ========================================================
     * TEST 3 - CONSULTAR USUARIO
     * ========================================================
     *
     * Endpoint:
     *
     *     GET /api/users/{id}
     *
     * ========================================================
     */
    public function test_can_show_user(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AUTENTICACIÓN
        |--------------------------------------------------------------------------
        */

        $token = $this->authenticate();


        /*
        |--------------------------------------------------------------------------
        | CREAR USUARIO
        |--------------------------------------------------------------------------
        */

        $user = User::create([
            'code' => 'USR-000002',

            'name' => 'Usuario Detalle',

            'email' => 'detalle@example.com',

            'password' => Hash::make(
                'Password123!'
            ),
        ]);


        /*
        |--------------------------------------------------------------------------
        | CONSULTAR USUARIO
        |--------------------------------------------------------------------------
        */

        $response = $this->withToken($token)
            ->getJson(
                '/api/users/'.$user->getKey()
            );


        /*
        |--------------------------------------------------------------------------
        | VERIFICAR RESPUESTA
        |--------------------------------------------------------------------------
        */

        $response
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Usuario obtenido correctamente.'
            )
            ->assertJsonPath(
                'data.email',
                'detalle@example.com'
            )
            ->assertJsonMissingPath(
                'data.password'
            );
    }


    /**
     * ========================================================
     * TEST 4 - ACTUALIZAR USUARIO
     * ========================================================
     *
     * Endpoint:
     *
     *     PUT /api/users/{id}
     *
     * ========================================================
     */
    public function test_can_update_user(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AUTENTICACIÓN
        |--------------------------------------------------------------------------
        */

        $token = $this->authenticate();


        /*
        |--------------------------------------------------------------------------
        | CREAR USUARIO
        |--------------------------------------------------------------------------
        */

        $user = User::create([
            'code' => 'USR-000002',

            'name' => 'Usuario Original',

            'email' => 'update@example.com',

            'password' => Hash::make(
                'Password123!'
            ),
        ]);


        /*
        |--------------------------------------------------------------------------
        | ACTUALIZAR
        |--------------------------------------------------------------------------
        */

        $accessProfile = \App\Models\AccessProfile::where(
            'code',
            'PRF-TEST-USERS'
        )->firstOrFail();

        $accessProfile = \App\Models\AccessProfile::where(
            'code',
            'PRF-TEST-USERS'
        )->firstOrFail();

        $response = $this->withToken($token)
            ->putJson(
                '/api/users/'.$user->getKey(),
                [
                    'name' => 'Usuario Actualizado',
                    'email' => 'update@example.com',
                    'phone' => '+523141234567',
                    'profile_ids' => [
                        (string) $accessProfile->getKey(),
                    ],
                ]
            );

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR RESPUESTA
        |--------------------------------------------------------------------------
        */

        $response
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Usuario actualizado correctamente.'
            )
            ->assertJsonPath(
                'data.name',
                'Usuario Actualizado'
            )
            ->assertJsonPath(
                'data.code',
                'USR-000002'
            )
            ->assertJsonMissingPath(
                'data.password'
            );


        /*
        |--------------------------------------------------------------------------
        | VERIFICAR MONGODB
        |--------------------------------------------------------------------------
        */

        $this->assertDatabaseHas(
            'users',
            [
                'email' => 'update@example.com',

                'name' => 'Usuario Actualizado',
            ]
        );
    }


    /**
     * ========================================================
     * TEST 5 - ELIMINAR USUARIO
     * ========================================================
     *
     * Endpoint:
     *
     *     DELETE /api/users/{id}
     *
     * ========================================================
     */
    public function test_can_delete_user(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AUTENTICACIÓN
        |--------------------------------------------------------------------------
        */

        $token = $this->authenticate();


        /*
        |--------------------------------------------------------------------------
        | CREAR USUARIO
        |--------------------------------------------------------------------------
        */

        $user = User::create([
            'code' => 'USR-000002',

            'name' => 'Usuario Eliminar',

            'email' => 'delete@example.com',

            'password' => Hash::make(
                'Password123!'
            ),
        ]);


        /*
        |--------------------------------------------------------------------------
        | ELIMINAR
        |--------------------------------------------------------------------------
        */

        $response = $this->withToken($token)
            ->deleteJson(
                '/api/users/'.$user->getKey()
            );


        /*
        |--------------------------------------------------------------------------
        | VERIFICAR RESPUESTA
        |--------------------------------------------------------------------------
        */

        $response
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Usuario eliminado correctamente.'
            );


        /*
        |--------------------------------------------------------------------------
        | VERIFICAR ELIMINACIÓN
        |--------------------------------------------------------------------------
        */

        $this->assertDatabaseMissing(
            'users',
            [
                'email' => 'delete@example.com',
            ]
        );
    }


    /**
     * ========================================================
     * TEST 6 - CORREO DUPLICADO
     * ========================================================
     *
     * Endpoint:
     *
     *     POST /api/users
     *
     * Debe responder:
     *
     *     HTTP 422
     *
     * ========================================================
     */
    public function test_cannot_create_user_with_duplicate_email(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AUTENTICACIÓN
        |--------------------------------------------------------------------------
        */

        $token = $this->authenticate();


        /*
        |--------------------------------------------------------------------------
        | SIMULAR ALMACENAMIENTO
        |--------------------------------------------------------------------------
        */

        Storage::fake('public');


        /*
        |--------------------------------------------------------------------------
        | CREAR USUARIO EXISTENTE
        |--------------------------------------------------------------------------
        */

        User::create([
            'code' => 'USR-000002',

            'name' => 'Usuario Existente',

            'email' => 'duplicate@example.com',

            'password' => Hash::make(
                'Password123!'
            ),
        ]);


        /*
        |--------------------------------------------------------------------------
        | INTENTAR DUPLICAR CORREO
        |--------------------------------------------------------------------------
        */

        $accessProfile = \App\Models\AccessProfile::where(
            'code',
            'PRF-TEST-USERS'
        )->firstOrFail();

        $response = $this->withToken($token)
            ->postJson(
                '/api/users',
                [
                    'name' => 'Usuario Duplicado',
                    'email' => 'duplicate@example.com',
                    'password' => 'Password123!',
                    'profile_photo' => UploadedFile::fake()->image(
                        'profile.jpg'
                    ),
                    'profile_ids' => [
                        (string) $accessProfile->getKey(),
                    ],
                ]
            );


        /*
        |--------------------------------------------------------------------------
        | VERIFICAR VALIDACIÓN
        |--------------------------------------------------------------------------
        */

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'email',
            ]);
    }


    /**
     * ========================================================
     * TEST 7 - HASH DE CONTRASEÑA
     * ========================================================
     *
     * Comprueba que la contraseña nunca se almacene
     * como texto plano.
     *
     * ========================================================
     */
    public function test_password_is_hashed(): void
    {
        /*
        |--------------------------------------------------------------------------
        | CONTRASEÑA
        |--------------------------------------------------------------------------
        */

        $plainPassword = 'Password123!';


        /*
        |--------------------------------------------------------------------------
        | CREAR USUARIO
        |--------------------------------------------------------------------------
        */

        $user = User::create([
            'code' => 'USR-000001',

            'name' => 'Usuario Password',

            'email' => 'password@example.com',

            'password' => Hash::make(
                $plainPassword
            ),
        ]);


        /*
        |--------------------------------------------------------------------------
        | RECARGAR MODELO
        |--------------------------------------------------------------------------
        */

        $user->refresh();


        /*
        |--------------------------------------------------------------------------
        | NO DEBE SER TEXTO PLANO
        |--------------------------------------------------------------------------
        */

        $this->assertNotSame(
            $plainPassword,
            $user->password
        );


        /*
        |--------------------------------------------------------------------------
        | HASH::CHECK
        |--------------------------------------------------------------------------
        */

        $this->assertTrue(
            Hash::check(
                $plainPassword,
                $user->password
            )
        );
    }


    /**
     * ========================================================
     * TEST 8 - CONTRASEÑA OCULTA
     * ========================================================
     *
     * Comprueba que la API nunca exponga password.
     *
     * ========================================================
     */
    public function test_password_is_hidden_from_api_response(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AUTENTICACIÓN
        |--------------------------------------------------------------------------
        */

        $token = $this->authenticate();


        /*
        |--------------------------------------------------------------------------
        | CREAR USUARIO
        |--------------------------------------------------------------------------
        */

        $user = User::create([
            'code' => 'USR-000002',

            'name' => 'Usuario Seguro',

            'email' => 'secure@example.com',

            'password' => Hash::make(
                'Password123!'
            ),
        ]);


        /*
        |--------------------------------------------------------------------------
        | CONSULTAR API
        |--------------------------------------------------------------------------
        */

        $response = $this->withToken($token)
            ->getJson(
                '/api/users/'.$user->getKey()
            );


        /*
        |--------------------------------------------------------------------------
        | VERIFICAR RESPUESTA
        |--------------------------------------------------------------------------
        */

        $response
            ->assertOk()
            ->assertJsonMissingPath(
                'data.password'
            );
    }
}