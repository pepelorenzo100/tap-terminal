<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use App\Traits\Auditable;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL
| SECTION MODEL
|--------------------------------------------------------------------------
|
| Representa una sección funcional del sistema.
|
| Las secciones son utilizadas por los perfiles de autorización
| para determinar qué partes de TAP Terminal puede utilizar
| cada usuario.
|
| Ejemplos:
|
|     Dashboard
|     Productos
|     Usuarios
|     Perfiles
|
|--------------------------------------------------------------------------
*/

class Section extends Model
{

/*
    |--------------------------------------------------------------------------
    | AUDITORÍA
    |--------------------------------------------------------------------------
    |
    | Registra automáticamente en bitácora cada creación, edición o
    | eliminación de una sección del sistema.
    |
    */

    use Auditable;                    
    
    /*
    |--------------------------------------------------------------------------
    | CONEXIÓN MONGODB
    |--------------------------------------------------------------------------
    */

    protected $connection = 'mongodb';


    /*
    |--------------------------------------------------------------------------
    | COLECCIÓN
    |--------------------------------------------------------------------------
    */

    protected $table = 'sections';


    /*
    |--------------------------------------------------------------------------
    | CAMPOS ASIGNABLES
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'code',
        'name',
        'description',
        'route',
    ];
}