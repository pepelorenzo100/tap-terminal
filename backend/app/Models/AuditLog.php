<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Support\Str;
use MongoDB\Laravel\Eloquent\Model;

/**
 * Modelo de Bitácora (Audit Log).
 *
 * Registra cada operación de creación, edición o eliminación realizada
 * sobre las entidades auditadas del sistema (productos, usuarios,
 * perfiles, secciones), guardando el valor anterior y el valor actual
 * del registro afectado.
 *
 * Este modelo es de solo escritura desde el punto de vista del negocio:
 * los registros de bitácora no se editan ni se eliminan manualmente,
 * se crean automáticamente mediante el trait App\Traits\Auditable.
 *
 * Colección MongoDB: audit_logs
 */
class AuditLog extends Model
{
    /**
     * Conexión y colección utilizadas en MongoDB.
     */
    protected $connection = 'mongodb';
    protected $collection = 'audit_logs';

    /**
     * Campos asignables mediante asignación masiva.
     *
     * "code" queda fuera a propósito: se genera automáticamente en el
     * evento "creating", igual que en el modelo Product, para que nunca
     * pueda ser sobrescrito desde una petición externa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'entity',       // Entidad auditada: products | users | access_profiles | sections | user_profiles
        'entity_id',    // _id del registro afectado en su colección de origen
        'action',       // Acción realizada: create | update | delete
        'old_values',   // Estado anterior del registro (null si action = create)
        'new_values',   // Estado actual del registro (null si action = delete)
        'performed_by', // Id del usuario autenticado que hizo el cambio
    ];

    /**
     * old_values y new_values se guardan como arreglos asociativos;
     * MongoDB los persiste de forma nativa como documentos embebidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    /**
     * Laravel administra created_at / updated_at automáticamente.
     */
    public $timestamps = true;

    /**
     * Genera el código único de la bitácora antes de insertarla,
     * con el mismo criterio (ULID) que Product.
     */
    protected static function booted(): void
    {
        static::creating(function (self $auditLog): void {
            if (empty($auditLog->code)) {
                $auditLog->code = 'LOG-' . strtoupper((string) Str::ulid());
            }
        });
    }
}
