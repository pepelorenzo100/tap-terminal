<?php

/*
|--------------------------------------------------------------------------
| TAP TERMINAL
| PRUEBAS CRUD DE PRODUCTOS
|--------------------------------------------------------------------------
|
| Archivo:
| tests/Feature/ProductTest.php
|
| Tipo:
| BACKEND - Laravel / PHP / PHPUnit
|
| Responsabilidad:
|
| Verificar directamente el funcionamiento de la API
| REST de productos utilizando autenticación Laravel Sanctum.
|
| Las pruebas comprueban:
|
| 1. Crear producto.
| 2. Listar productos.
| 3. Consultar un producto.
| 4. Actualizar un producto.
| 5. Eliminar un producto.
| 6. Validar datos incorrectos.
|
| Seguridad:
|
| Todas las rutas de productos requieren:
|
|     auth:sanctum
|
| Por eso cada prueba CRUD crea un usuario de prueba,
| inicia sesión y utiliza el token Bearer obtenido.
|
|--------------------------------------------------------------------------
*/

namespace Tests\Feature;

/*
|--------------------------------------------------------------------------
| PRODUCT MODEL
|--------------------------------------------------------------------------
|
| Modelo utilizado para crear y verificar productos
| almacenados en MongoDB.
|
*/

use App\Models\Product;

/*
|--------------------------------------------------------------------------
| USER MODEL
|--------------------------------------------------------------------------
|
| Usuario utilizado para autenticarse durante las pruebas.
|
*/

use App\Models\User;

/*
|--------------------------------------------------------------------------
| HASH
|--------------------------------------------------------------------------
|
| Permite crear una contraseña válida para el usuario
| utilizado durante las pruebas.
|
*/

use Illuminate\Support\Facades\Hash;

/*
|--------------------------------------------------------------------------
| TEST CASE
|--------------------------------------------------------------------------
|
| Clase base proporcionada por Laravel para realizar
| pruebas HTTP y de aplicación.
|
*/

use Tests\TestCase;


/**
 * ============================================================
 * PRODUCT TEST
 * ============================================================
 *
 * Pruebas funcionales de la API REST de productos.
 *
 * Flujo comprobado:
 *
 * HTTP
 *   ↓
 * Sanctum
 *   ↓
 * ProductController
 *   ↓
 * Product
 *   ↓
 * MongoDB
 *
 * ============================================================
 */
class ProductTest extends TestCase
{
    /**
     * ========================================================
     * PREPARAR CADA PRUEBA
     * ========================================================
     *
     * Cada prueba comienza con un usuario de autenticación
     * independiente.
     *
     * También eliminamos los productos existentes para evitar
     * que una prueba dependa de otra.
     */
    protected function setUp(): void
    {
        parent::setUp();

        /*
        |--------------------------------------------------------------------------
        | LIMPIAR PRODUCTOS
        |--------------------------------------------------------------------------
        |
        | Eliminamos los productos existentes antes de cada prueba.
        |
        */

        Product::query()->delete();

        /*
        |--------------------------------------------------------------------------
        | LIMPIAR USUARIOS
        |--------------------------------------------------------------------------
        |
        | Eliminamos usuarios anteriores para mantener
        | las pruebas aisladas.
        |
        */

        User::query()->delete();
    }


    /**
     * ========================================================
     * CREAR USUARIO AUTENTICADO
     * ========================================================
     *
     * Crea un usuario exclusivamente para las pruebas
     * protegidas mediante Sanctum.
     *
     * El usuario se crea directamente en MongoDB y después
     * se utiliza el endpoint real /api/login para obtener
     * un token Bearer.
     *
     * De esta manera las pruebas utilizan el mismo flujo
     * de autenticación que utiliza Angular.
     */
    private function authenticate(): string
    {
        /*
        |--------------------------------------------------------------------------
        | CREAR USUARIO
        |--------------------------------------------------------------------------
        */

        $user = User::create([
            'code' => 'USR-'.fake()->unique()->numerify('######'),

            'name' => 'Usuario Product Test',

            'email' => fake()->unique()->safeEmail(),

            'phone' => '+523141234567',

            'password' => Hash::make(
                'Password123!'
            ),
        ]);

        /*
        |--------------------------------------------------------------------------
        | REALIZAR LOGIN
        |--------------------------------------------------------------------------
        |
        | Utilizamos el endpoint real de autenticación.
        |
        */

        $response = $this->postJson(
            '/api/login',
            [
                'email' => $user->email,

                'password' => 'Password123!',

                'device_name' => 'TAP Terminal Product Test',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | COMPROBAR LOGIN
        |--------------------------------------------------------------------------
        */

        $response->assertOk();

        /*
        |--------------------------------------------------------------------------
        | OBTENER TOKEN
        |--------------------------------------------------------------------------
        */

        return $response->json(
            'data.token'
        );
    }


    /**
     * ========================================================
     * CREAR PRODUCTO
     * ========================================================
     *
     * Verifica:
     *
     * POST /api/products
     *
     * Debe:
     *
     * - aceptar los datos válidos;
     * - responder HTTP 201;
     * - generar automáticamente un código;
     * - devolver el producto creado.
     *
     * ========================================================
     */
    public function test_can_create_product(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AUTENTICACIÓN
        |--------------------------------------------------------------------------
        */

        $token = $this->authenticate();

        /*
        |--------------------------------------------------------------------------
        | DATOS DEL PRODUCTO
        |--------------------------------------------------------------------------
        */

        $data = [
            'name' => 'Producto de prueba',

            'brand' => 'TAP',

            'price' => 250.00,
        ];

        /*
        |--------------------------------------------------------------------------
        | REALIZAR PETICIÓN POST
        |--------------------------------------------------------------------------
        |
        | withToken() agrega:
        |
        | Authorization: Bearer TOKEN
        |
        */

        $response = $this->withToken($token)
            ->postJson(
                '/api/products',
                $data
            );

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR RESPUESTA HTTP
        |--------------------------------------------------------------------------
        |
        | 201 significa:
        |
        | Created
        |
        */

        $response->assertStatus(201);

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR ESTRUCTURA
        |--------------------------------------------------------------------------
        */

        $response->assertJsonStructure([
            'id',
            'name',
            'brand',
            'price',
            'code',
            'created_at',
            'updated_at',
        ]);

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR DATOS
        |--------------------------------------------------------------------------
        */

        $response->assertJsonPath(
            'name',
            'Producto de prueba'
        );

        $response->assertJsonPath(
            'brand',
            'TAP'
        );

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR CÓDIGO AUTOMÁTICO
        |--------------------------------------------------------------------------
        */

        $this->assertStringStartsWith(
            'PROD-',
            $response->json('code')
        );

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR EXISTENCIA EN BASE DE DATOS
        |--------------------------------------------------------------------------
        */

        $this->assertDatabaseHas(
            'products',
            [
                'name' => 'Producto de prueba',

                'brand' => 'TAP',
            ]
        );
    }


    /**
     * ========================================================
     * LISTAR PRODUCTOS
     * ========================================================
     *
     * Verifica:
     *
     * GET /api/products
     *
     * ========================================================
     */
    public function test_can_list_products(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AUTENTICACIÓN
        |--------------------------------------------------------------------------
        */

        $token = $this->authenticate();

        /*
        |--------------------------------------------------------------------------
        | CREAR PRODUCTO DE PRUEBA
        |--------------------------------------------------------------------------
        */

        Product::create([
            'name' => 'Producto listado',

            'brand' => 'TAP',

            'price' => 100.00,
        ]);

        /*
        |--------------------------------------------------------------------------
        | REALIZAR PETICIÓN GET
        |--------------------------------------------------------------------------
        */

        $response = $this->withToken($token)
            ->getJson(
                '/api/products'
            );

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR RESPUESTA
        |--------------------------------------------------------------------------
        */

        $response->assertStatus(200);

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR QUE SEA UN ARREGLO JSON
        |--------------------------------------------------------------------------
        */

        $response->assertJsonIsArray();

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR PRODUCTO
        |--------------------------------------------------------------------------
        */

        $response->assertJsonFragment([
            'name' => 'Producto listado',

            'brand' => 'TAP',
        ]);
    }


    /**
     * ========================================================
     * MOSTRAR PRODUCTO
     * ========================================================
     *
     * Verifica:
     *
     * GET /api/products/{id}
     *
     * ========================================================
     */
    public function test_can_show_product(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AUTENTICACIÓN
        |--------------------------------------------------------------------------
        */

        $token = $this->authenticate();

        /*
        |--------------------------------------------------------------------------
        | CREAR PRODUCTO
        |--------------------------------------------------------------------------
        */

        $product = Product::create([
            'name' => 'Producto individual',

            'brand' => 'TAP',

            'price' => 300.00,
        ]);

        /*
        |--------------------------------------------------------------------------
        | CONSULTAR PRODUCTO
        |--------------------------------------------------------------------------
        */

        $response = $this->withToken($token)
            ->getJson(
                '/api/products/'.$product->id
            );

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR RESPUESTA
        |--------------------------------------------------------------------------
        */

        $response->assertStatus(200);

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR DATOS
        |--------------------------------------------------------------------------
        */

        $response->assertJson([
            'id' => (string) $product->id,

            'name' => 'Producto individual',

            'brand' => 'TAP',
        ]);
    }


    /**
     * ========================================================
     * ACTUALIZAR PRODUCTO
     * ========================================================
     *
     * Verifica:
     *
     * PUT /api/products/{id}
     *
     * ========================================================
     */
    public function test_can_update_product(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AUTENTICACIÓN
        |--------------------------------------------------------------------------
        */

        $token = $this->authenticate();

        /*
        |--------------------------------------------------------------------------
        | CREAR PRODUCTO
        |--------------------------------------------------------------------------
        */

        $product = Product::create([
            'name' => 'Producto original',

            'brand' => 'TAP',

            'price' => 200.00,
        ]);

        /*
        |--------------------------------------------------------------------------
        | GUARDAR CÓDIGO ORIGINAL
        |--------------------------------------------------------------------------
        |
        | El código NO debe cambiar al actualizar.
        |
        */

        $originalCode = $product->code;

        /*
        |--------------------------------------------------------------------------
        | DATOS NUEVOS
        |--------------------------------------------------------------------------
        */

        $data = [
            'name' => 'Producto actualizado',

            'brand' => 'TAP',

            'price' => 450.00,
        ];

        /*
        |--------------------------------------------------------------------------
        | REALIZAR PETICIÓN PUT
        |--------------------------------------------------------------------------
        */

        $response = $this->withToken($token)
            ->putJson(
                '/api/products/'.$product->id,
                $data
            );

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR RESPUESTA
        |--------------------------------------------------------------------------
        */

        $response->assertStatus(200);

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR DATOS ACTUALIZADOS
        |--------------------------------------------------------------------------
        */

        $response->assertJsonPath(
            'name',
            'Producto actualizado'
        );

        $response->assertJsonPath(
            'brand',
            'TAP'
        );

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR QUE EL CÓDIGO NO CAMBIÓ
        |--------------------------------------------------------------------------
        */

        $response->assertJsonPath(
            'code',
            $originalCode
        );
    }


    /**
     * ========================================================
     * ELIMINAR PRODUCTO
     * ========================================================
     *
     * Verifica:
     *
     * DELETE /api/products/{id}
     *
     * ========================================================
     */
    public function test_can_delete_product(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AUTENTICACIÓN
        |--------------------------------------------------------------------------
        */

        $token = $this->authenticate();

        /*
        |--------------------------------------------------------------------------
        | CREAR PRODUCTO
        |--------------------------------------------------------------------------
        */

        $product = Product::create([
            'name' => 'Producto para eliminar',

            'brand' => 'TAP',

            'price' => 150.00,
        ]);

        /*
        |--------------------------------------------------------------------------
        | REALIZAR PETICIÓN DELETE
        |--------------------------------------------------------------------------
        */

        $response = $this->withToken($token)
            ->deleteJson(
                '/api/products/'.$product->id
            );

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR RESPUESTA
        |--------------------------------------------------------------------------
        */

        $response->assertStatus(200);

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR MENSAJE
        |--------------------------------------------------------------------------
        */

        $response->assertJson([
            'message' => 'Producto eliminado correctamente.',
        ]);

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR QUE YA NO EXISTA
        |--------------------------------------------------------------------------
        */

        $this->assertDatabaseMissing(
            'products',
            [
                '_id' => $product->id,
            ]
        );
    }


    /**
     * ========================================================
     * VALIDAR DATOS
     * ========================================================
     *
     * Verifica que Laravel rechace un producto
     * con datos inválidos.
     *
     * IMPORTANTE:
     *
     * La petición sigue necesitando autenticación.
     *
     * Primero Sanctum valida el token y después Laravel
     * ejecuta las reglas de validación.
     *
     * ========================================================
     */
    public function test_cannot_create_product_with_invalid_data(): void
    {
        /*
        |--------------------------------------------------------------------------
        | AUTENTICACIÓN
        |--------------------------------------------------------------------------
        */

        $token = $this->authenticate();

        /*
        |--------------------------------------------------------------------------
        | DATOS INVÁLIDOS
        |--------------------------------------------------------------------------
        */

        $data = [
            'name' => '',

            'brand' => '',

            'price' => 5000,
        ];

        /*
        |--------------------------------------------------------------------------
        | REALIZAR PETICIÓN
        |--------------------------------------------------------------------------
        */

        $response = $this->withToken($token)
            ->postJson(
                '/api/products',
                $data
            );

        /*
        |--------------------------------------------------------------------------
        | HTTP 422
        |--------------------------------------------------------------------------
        |
        | Laravel utiliza 422 cuando los datos
        | no cumplen las reglas de validación.
        |
        */

        $response->assertStatus(422);

        /*
        |--------------------------------------------------------------------------
        | VERIFICAR ERRORES
        |--------------------------------------------------------------------------
        */

        $response->assertJsonValidationErrors([
            'name',

            'brand',

            'price',
        ]);
    }
}