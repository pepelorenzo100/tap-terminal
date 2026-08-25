<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Pruebas del módulo de bitácora.
 *
 * Verifica que las operaciones sobre un modelo auditable (Product,
 * usado aquí como ejemplo) generen automáticamente el registro
 * correspondiente en audit_logs, y que el endpoint de consulta
 * responda correctamente para un usuario autenticado.
 */
class AuditLogTest extends TestCase
{
    /**
     * Al crear un producto debe generarse un registro de bitácora
     * con acción "create" y sin valores anteriores.
     */
    public function test_crear_producto_genera_bitacora(): void
    {
        $product = Product::create([
            'name'  => 'Producto de prueba',
            'brand' => 'TAP Terminal',
            'price' => 100,
        ]);

        $log = AuditLog::where('entity_id', (string) $product->getKey())
            ->where('action', 'create')
            ->first();

        $this->assertNotNull($log, 'Debe existir un registro de bitácora tipo create.');
        $this->assertSame('products', $log->entity);
        $this->assertNull($log->old_values);
        $this->assertNotEmpty($log->new_values);
    }

    /**
     * Al actualizar un producto debe generarse un registro de bitácora
     * con acción "update", incluyendo el valor anterior y el nuevo.
     */
    public function test_editar_producto_genera_bitacora_con_valores_anteriores(): void
    {
        $product = Product::create([
            'name'  => 'Producto original',
            'brand' => 'TAP Terminal',
            'price' => 100,
        ]);

        $product->update(['price' => 150]);

        $log = AuditLog::where('entity_id', (string) $product->getKey())
            ->where('action', 'update')
            ->first();

        $this->assertNotNull($log);
        $this->assertNotEmpty($log->old_values);
        $this->assertNotEmpty($log->new_values);
    }

    /**
     * El endpoint GET /api/audit-logs debe responder 200
     * y permitir filtrar por entidad, para un usuario autenticado.
     *
     * La ruta está protegida con auth:sanctum, por lo que es
     * necesario autenticar un usuario de prueba antes de llamarla
     * (con $this->actingAs, tal como recomienda la documentación
     * de testing de Laravel).
     */
    public function test_endpoint_de_bitacora_responde_correctamente(): void
    {
        // Usuario de prueba, con los campos mínimos que exige el
        // modelo User (ver app/Models/User.php -> $fillable).
        $user = User::create([
            'code'          => 'USR-TEST-001',
            'name'          => 'Usuario de prueba',
            'email'         => 'usuario.prueba@tapterminal.test',
            'phone'         => null,
            'profile_photo' => null,
            'password'      => Hash::make('password-de-prueba'),
        ]);

        Product::create([
            'name'  => 'Producto para bitácora',
            'brand' => 'TAP Terminal',
            'price' => 200,
        ]);

        $response = $this
            ->actingAs($user)
            ->getJson('/api/audit-logs?entity=products');

        $response->assertStatus(200);
    }
}