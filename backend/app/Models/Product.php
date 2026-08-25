<?php

namespace App\Models;

use Illuminate\Support\Str;
use MongoDB\Laravel\Eloquent\Model;
use App\Traits\Auditable;

/**
 * ============================================================
 * TAP TERMINAL
 * MODELO PRODUCT
 * ============================================================
 *
 * Archivo:
 *
 *     app/Models/Product.php
 *
 * Tipo:
 *
 *     BACKEND - Laravel / PHP
 *
 * Base de datos:
 *
 *     MongoDB
 *
 * Colección:
 *
 *     products
 *
 * ============================================================
 *
 * RESPONSABILIDADES DEL MODELO
 * ============================================================
 *
 * Este modelo representa un producto dentro del sistema
 * TAP Terminal.
 *
 * Sus principales responsabilidades son:
 *
 * 1. Representar los documentos de productos almacenados
 *    en MongoDB.
 *
 * 2. Definir la colección utilizada por MongoDB.
 *
 * 3. Definir los campos que pueden ser asignados
 *    masivamente.
 *
 * 4. Convertir el precio al tipo de dato correspondiente.
 *
 * 5. Generar automáticamente el código del producto.
 *
 * 6. Permitir que Laravel administre automáticamente:
 *
 *       created_at
 *       updated_at
 *
 * ============================================================
 *
 * FLUJO
 * ============================================================
 *
 * Angular
 *    ↓
 * ProductService
 *    ↓
 * HTTP POST / PUT / DELETE / GET
 *    ↓
 * ProductController
 *    ↓
 * Product
 *    ↓
 * MongoDB
 *
 * ============================================================
 */
class Product extends Model
{

/*
    |--------------------------------------------------------------------------
    | AUDITORÍA
    |--------------------------------------------------------------------------
    |
    | Registra automáticamente en bitácora cada creación, edición o
    | eliminación de un producto.
    |
    */

    use Auditable; 

    /**
     * ========================================================
     * COLECCIÓN DE MONGODB
     * ========================================================
     *
     * Define explícitamente la colección donde se
     * almacenarán los productos.
     *
     * MongoDB:
     *
     *     products
     *
     * ========================================================
     */
    protected $collection = 'products';

    /**
     * ========================================================
     * TIMESTAMPS
     * ========================================================
     *
     * Laravel administrará automáticamente los campos:
     *
     *     created_at
     *     updated_at
     *
     * Esto significa que no necesitamos enviarlos
     * manualmente desde Angular.
     *
     * Al crear:
     *
     *     created_at
     *     updated_at
     *
     * Al actualizar:
     *
     *     updated_at
     *
     * ========================================================
     */
    public $timestamps = true;

    /**
     * ========================================================
     * ASIGNACIÓN MASIVA
     * ========================================================
     *
     * Define los campos que pueden ser utilizados
     * mediante asignación masiva.
     *
     * Por ejemplo:
     *
     *     Product::create($validated);
     *
     * o:
     *
     *     $product->update($validated);
     *
     * ========================================================
     *
     * CAMPOS PERMITIDOS:
     *
     *     name
     *     brand
     *     price
     *
     * ========================================================
     *
     * IMPORTANTE:
     *
     * "code" NO está incluido.
     *
     * Esto es intencional.
     *
     * El código debe ser generado exclusivamente
     * por el backend.
     *
     * De esta manera evitamos que el frontend
     * pueda establecer o modificar libremente
     * el código del producto.
     *
     * ========================================================
     */
    protected $fillable = [
        'name',
        'brand',
        'price',
    ];

    /**
     * ========================================================
     * CONVERSIÓN DE TIPOS
     * ========================================================
     *
     * Define cómo Laravel debe interpretar determinados
     * campos del modelo.
     *
     * El precio representa un valor monetario.
     *
     * Se utiliza decimal con dos posiciones:
     *
     *     250
     *     250.50
     *     999.99
     *
     * Esto es preferible a utilizar float para valores
     * monetarios porque evita depender de la representación
     * binaria de los números de punto flotante.
     *
     * ========================================================
     */
    protected $casts = [
        'price' => 'decimal:2',
    ];

    /**
     * ========================================================
     * EVENTOS DEL MODELO
     * ========================================================
     *
     * booted() permite registrar eventos del ciclo de vida
     * del modelo Eloquent.
     *
     * En este caso utilizamos el evento:
     *
     *     creating
     *
     * Este evento se ejecuta antes de que Laravel
     * cree un nuevo documento en MongoDB.
     *
     * ========================================================
     */
    protected static function booted(): void
    {
        /**
         * ====================================================
         * EVENTO CREATING
         * ====================================================
         *
         * Se ejecuta automáticamente antes de insertar
         * un nuevo producto.
         *
         * ====================================================
         */
        static::creating(function (Product $product): void {

            /**
             * =================================================
             * GENERACIÓN AUTOMÁTICA DEL CÓDIGO
             * =================================================
             *
             * Si el producto todavía no tiene código,
             * el backend genera uno automáticamente.
             *
             * Formato:
             *
             *     PROD-XXXXXXXXXXXXXXXXXXXXXXXXXX
             *
             * Ejemplo:
             *
             *     PROD-01M0JQ510K901CYY1CC6PR17MF
             *
             * =================================================
             *
             * Str::ulid()
             *
             * Genera un identificador ULID.
             *
             * (string)
             *
             * Convierte el ULID en texto.
             *
             * strtoupper()
             *
             * Convierte el resultado a mayúsculas.
             *
             * =================================================
             */
            if (empty($product->code)) {

                $product->code =
                    'PROD-'.strtoupper(
                        (string) Str::ulid()
                    );

            }

        });
    }
}
