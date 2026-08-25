<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use App\Traits\Auditable;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL
| ACCESS PROFILE MODEL
|--------------------------------------------------------------------------
|
| Representa un perfil de autorización.
|
| Un perfil determina qué secciones del sistema puede
| utilizar un usuario.
|
| Ejemplos:
|
|     PRF-ADMIN
|     PRF-OPERATOR
|
|--------------------------------------------------------------------------
*/

class AccessProfile extends Model
{

/*
    |--------------------------------------------------------------------------
    | AUDITORÍA
    |--------------------------------------------------------------------------
    |
    | Registra automáticamente en bitácora cada creación, edición o
    | eliminación de un perfil de autorización.
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

    protected $table = 'access_profiles';


    /*
    |--------------------------------------------------------------------------
    | CAMPOS ASIGNABLES
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'code',
        'name',
        'description',
        'section_ids',
    ];


    /*
    |--------------------------------------------------------------------------
    | CASTS
    |--------------------------------------------------------------------------
    |
    | MongoDB almacena section_ids como un arreglo.
    |
    */

    protected function casts(): array
    {
        return [
            'section_ids' => 'array',
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | OBTENER SECCIONES
    |--------------------------------------------------------------------------
    |
    | Busca en MongoDB las secciones cuyos IDs están asignados
    | al perfil.
    |
    */

    public function sections()
    {
        if (empty($this->section_ids)) {
            return collect();
        }

        return Section::whereIn(
            '_id',
            $this->section_ids
        )->get();
    }
}