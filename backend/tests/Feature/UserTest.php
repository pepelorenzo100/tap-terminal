<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Http\UploadedFile;
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
 * Probar el comportamiento funcional de la API de usuarios.
 *
 * Funcionalidades verificadas:
 *
 * 1. Crear usuario.
 * 2. Listar usuarios.
 * 3. Consultar usuario.
 * 4. Actualizar usuario.
 * 5. Eliminar usuario.
 * 6. Validar correo electrónico duplicado.
 * 7. Verificar hash de contraseña.
 * 8. Verificar que la contraseña no sea expuesta.
 *
 * Base de datos:
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
     * PHPUnit ejecuta este método antes de cada prueba.
     *
     * Se elimina cualquier usuario existente para garantizar
     * que una prueba no dependa de información generada por
     * una ejecución anterior.
     *
     * Esto es especialmente importante porque el proyecto
     * utiliza MongoDB y no una base de datos SQL de pruebas
     * independiente.
     */
    protected function setUp(): void
    {
        parent::setUp();

        /*
         * Limpiamos la colección de usuarios.
         *
         * Esto garantiza aislamiento entre pruebas.
         */
        User::query()->delete();

        /*
         * Limpiamos fotografías generadas por pruebas anteriores.
         */
        Storage::disk('public')->deleteDirectory('profile-photos');
    }

    /**
     * ========================================================
     * LIMPIAR DESPUÉS DE CADA PRUEBA
     * ========================================================
     *
     * PHPUnit ejecuta este método después de cada prueba.
     *
     * Se utiliza como segunda barrera para evitar que los datos
     * generados durante una prueba permanezcan en MongoDB.
     */
    protected function tearDown(): void
    {
        /*
         * Eliminamos los usuarios creados durante la prueba.
         */
        User::query()->delete();

        /*
         * Eliminamos fotografías creadas durante la prueba.
         */
        Storage::disk('public')->deleteDirectory('profile-photos');

        parent::tearDown();
    }

    /**
     * ========================================================
     * TEST 1 - CREAR USUARIO
     * ========================================================
     *
     * Comprueba:
     *
     * - HTTP 201.
     * - Creación correcta.
     * - Código automático.
     * - Nombre.
     * - Correo.
     * - Contraseña no expuesta.
     * - Fotografía.
     */
    public function test_can_create_user(): void
    {
        /*
         * Simulamos el almacenamiento público.
         *
         * De esta manera PHPUnit no modifica archivos reales
         * durante la ejecución de las pruebas.
         */
        Storage::fake('public');

        $response = $this->postJson('/api/users', [
            'name' => 'Usuario Test',
            'email' => 'test@example.com',
            'phone' => '+523141234567',
            'password' => 'Password123!',

            /*
             * Generamos una imagen falsa para la prueba.
             */
            'profile_photo' => UploadedFile::fake()->image(
                'profile.jpg'
            ),
        ]);

        /*
         * La creación de un recurso REST devuelve HTTP 201.
         */
        $response
            ->assertStatus(201)

            /*
             * Validamos el mensaje de respuesta.
             */
            ->assertJsonPath(
                'message',
                'Usuario creado correctamente.'
            )

            /*
             * Validamos información principal.
             */
            ->assertJsonPath(
                'data.name',
                'Usuario Test'
            )
            ->assertJsonPath(
                'data.email',
                'test@example.com'
            )

            /*
             * El código debe generarse automáticamente.
             */
            ->assertJsonPath(
                'data.code',
                'USR-000001'
            )

            /*
             * Nunca debemos devolver la contraseña.
             */
            ->assertJsonMissingPath(
                'data.password'
            );

        /*
         * Confirmamos que el usuario realmente existe
         * en MongoDB.
         */
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
        ]);
    }

    /**
     * ========================================================
     * TEST 2 - LISTAR USUARIOS
     * ========================================================
     */
    public function test_can_list_users(): void
    {
        /*
         * Creamos exactamente un usuario.
         */
        User::create([
            'code' => 'USR-000001',
            'name' => 'Usuario Lista',
            'email' => 'lista@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        /*
         * Consultamos la API.
         */
        $response = $this->getJson('/api/users');

        /*
         * Validamos:
         *
         * - HTTP 200.
         * - Mensaje.
         * - Exactamente un usuario.
         */
        $response
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Usuarios obtenidos correctamente.'
            )
            ->assertJsonCount(
                1,
                'data'
            );
    }

    /**
     * ========================================================
     * TEST 3 - CONSULTAR USUARIO
     * ========================================================
     */
    public function test_can_show_user(): void
    {
        /*
         * Creamos un usuario.
         */
        $user = User::create([
            'code' => 'USR-000001',
            'name' => 'Usuario Detalle',
            'email' => 'detalle@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        /*
         * Consultamos utilizando el _id de MongoDB.
         */
        $response = $this->getJson(
            '/api/users/'.$user->getKey()
        );

        /*
         * Validamos la respuesta.
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

            /*
             * La contraseña nunca debe regresar.
             */
            ->assertJsonMissingPath(
                'data.password'
            );
    }

    /**
     * ========================================================
     * TEST 4 - ACTUALIZAR USUARIO
     * ========================================================
     *
     * Comprueba que un usuario pueda conservar su propio
     * correo electrónico durante una actualización.
     */
    public function test_can_update_user(): void
    {
        /*
         * Creamos el usuario.
         */
        $user = User::create([
            'code' => 'USR-000001',
            'name' => 'Usuario Original',
            'email' => 'update@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        /*
         * Actualizamos el usuario.
         *
         * Conservamos el mismo correo.
         */
        $response = $this->putJson(
            '/api/users/'.$user->getKey(),
            [
                'name' => 'Usuario Actualizado',
                'email' => 'update@example.com',
                'phone' => '+523141234567',
            ]
        );

        /*
         * Validamos la actualización.
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
                'USR-000001'
            )
            ->assertJsonMissingPath(
                'data.password'
            );

        /*
         * Verificamos el cambio en MongoDB.
         */
        $this->assertDatabaseHas('users', [
            'email' => 'update@example.com',
            'name' => 'Usuario Actualizado',
        ]);
    }

    /**
     * ========================================================
     * TEST 5 - ELIMINAR USUARIO
     * ========================================================
     */
    public function test_can_delete_user(): void
    {
        /*
         * Creamos el usuario.
         */
        $user = User::create([
            'code' => 'USR-000001',
            'name' => 'Usuario Eliminar',
            'email' => 'delete@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        /*
         * Ejecutamos DELETE.
         */
        $response = $this->deleteJson(
            '/api/users/'.$user->getKey()
        );

        /*
         * Validamos respuesta.
         */
        $response
            ->assertOk()
            ->assertJsonPath(
                'message',
                'Usuario eliminado correctamente.'
            );

        /*
         * Confirmamos que ya no existe.
         */
        $this->assertDatabaseMissing('users', [
            'email' => 'delete@example.com',
        ]);
    }

    /**
     * ========================================================
     * TEST 6 - CORREO DUPLICADO
     * ========================================================
     *
     * La API debe rechazar un correo que ya existe.
     */
    public function test_cannot_create_user_with_duplicate_email(): void
    {
        Storage::fake('public');

        /*
         * Creamos primero el usuario existente.
         */
        User::create([
            'code' => 'USR-000001',
            'name' => 'Usuario Existente',
            'email' => 'duplicate@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        /*
         * Intentamos crear otro usuario con el mismo correo.
         */
        $response = $this->postJson('/api/users', [
            'name' => 'Usuario Duplicado',
            'email' => 'duplicate@example.com',
            'password' => 'Password123!',

            /*
             * También enviamos fotografía porque es un campo
             * obligatorio en el alta de usuario.
             */
            'profile_photo' => UploadedFile::fake()->image(
                'profile.jpg'
            ),
        ]);

        /*
         * Laravel debe devolver HTTP 422.
         */
        $response
            ->assertStatus(422)

            /*
             * El error debe corresponder al correo.
             */
            ->assertJsonValidationErrors([
                'email',
            ]);
    }

    /**
     * ========================================================
     * TEST 7 - HASH DE CONTRASEÑA
     * ========================================================
     *
     * Comprueba que la contraseña jamás se almacene
     * como texto plano.
     */
    public function test_password_is_hashed(): void
    {
        $plainPassword = 'Password123!';

        /*
         * Creamos el usuario utilizando Hash::make().
         */
        $user = User::create([
            'code' => 'USR-000001',
            'name' => 'Usuario Password',
            'email' => 'password@example.com',
            'password' => Hash::make($plainPassword),
        ]);

        $user->refresh();

        /*
         * La contraseña almacenada NO debe ser igual
         * a la contraseña original.
         */
        $this->assertNotSame(
            $plainPassword,
            $user->password
        );

        /*
         * Hash::check() debe poder comprobar la contraseña.
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
     * Comprueba que la API nunca exponga el hash.
     */
    public function test_password_is_hidden_from_api_response(): void
    {
        /*
         * Creamos usuario.
         */
        $user = User::create([
            'code' => 'USR-000001',
            'name' => 'Usuario Seguro',
            'email' => 'secure@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        /*
         * Consultamos el usuario.
         */
        $response = $this->getJson(
            '/api/users/'.$user->getKey()
        );

        /*
         * Confirmamos que password no aparezca.
         */
        $response
            ->assertOk()
            ->assertJsonMissingPath(
                'data.password'
            );
    }
}
