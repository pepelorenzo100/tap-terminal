<?php

declare(strict_types=1);

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

/**
 * Trait Auditable.
 *
 * Agrega bitácora automática a cualquier modelo Eloquent (MongoDB) que
 * lo utilice. Basta con escribir "use Auditable;" dentro del modelo
 * (Product, User, AccessProfile, etc.) para que cada creación,
 * actualización o eliminación quede registrada en la colección
 * audit_logs, sin repetir esta lógica en cada controlador.
 *
 * Ejemplo de uso dentro de un modelo:
 *
 *   class Product extends Model
 *   {
 *       use Auditable;
 *       ...
 *   }
 *
 * No hace falta nada más: los listeners se registran solos mediante
 * el método estático bootAuditable(), que Eloquent llama
 * automáticamente al arrancar el modelo (convención boot + NombreDelTrait).
 */
trait Auditable
{
    /**
     * Registra los listeners de los eventos del modelo.
     * Eloquent invoca este método automáticamente porque su nombre
     * sigue el patrón "boot{NombreDelTrait}".
     */
    public static function bootAuditable(): void
    {
        static::created(function ($model): void {
            self::registrarBitacora($model, 'create', null, $model->toArray());
        });

        static::updated(function ($model): void {
            self::registrarBitacora(
                $model,
                'update',
                $model->getOriginal(),
                $model->getChanges()
            );
        });

        static::deleted(function ($model): void {
            self::registrarBitacora($model, 'delete', $model->toArray(), null);
        });
    }

    /**
     * Crea el registro de bitácora correspondiente.
     *
     * @param  mixed      $model      Instancia del modelo auditado
     * @param  string     $action     create | update | delete
     * @param  array|null $oldValues  Estado anterior del registro
     * @param  array|null $newValues  Estado actual del registro
     */
    protected static function registrarBitacora(
        $model,
        string $action,
        ?array $oldValues,
        ?array $newValues
    ): void {
        AuditLog::create([
            'entity'       => $model->getTable() ?? class_basename($model),
            'entity_id'    => (string) $model->getKey(),
            'action'       => $action,
            'old_values'   => $oldValues,
            'new_values'   => $newValues,
            // Auth::id() devuelve null si la operación no se hizo con
            // un usuario autenticado (ej. seeders o pruebas automatizadas).
            'performed_by' => Auth::id(),
        ]);
    }
}
