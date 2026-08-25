<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controlador de la Bitácora (Audit Log).
 *
 * Este controlador es de solo lectura: los registros de bitácora se
 * generan automáticamente mediante el trait App\Traits\Auditable y
 * nunca se crean, editan ni eliminan manualmente desde la API.
 *
 * Ruta expuesta:
 *   GET /api/audit-logs
 */
class AuditLogController extends Controller
{
    /**
     * Lista los registros de bitácora, con filtros opcionales.
     *
     * Filtros soportados vía query string:
     *   entity      products | users | access_profiles | sections | user_profiles
     *   entity_id   id del registro afectado
     *   from        fecha inicial (YYYY-MM-DD)
     *   to          fecha final   (YYYY-MM-DD)
     *
     * Ejemplo:
     *   GET /api/audit-logs?entity=products&from=2026-08-01&to=2026-08-25
     */
    public function index(Request $request): JsonResponse
    {
        // Se validan los filtros antes de usarlos: nunca se debe confiar
        // en los parámetros de query string sin validar, aunque sean opcionales.
        $filtros = $request->validate([
            'entity'    => 'sometimes|string|in:products,users,access_profiles,sections,user_profiles',
            'entity_id' => 'sometimes|string',
            'from'      => 'sometimes|date',
            'to'        => 'sometimes|date|after_or_equal:from',
        ]);

        $query = AuditLog::query();

        if (!empty($filtros['entity'])) {
            $query->where('entity', $filtros['entity']);
        }

        if (!empty($filtros['entity_id'])) {
            $query->where('entity_id', $filtros['entity_id']);
        }

        if (!empty($filtros['from'])) {
            $query->where('created_at', '>=', $filtros['from']);
        }

        if (!empty($filtros['to'])) {
            $query->where('created_at', '<=', $filtros['to']);
        }

        // Los registros más recientes primero, para revisión rápida en la evaluación.
        $registros = $query->orderByDesc('created_at')->paginate(25);

        return response()->json($registros, 200);
    }
}
