<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL
| PASSWORD RESET TOKEN MODEL
|--------------------------------------------------------------------------
|
| Modelo utilizado para almacenar temporalmente los tokens de
| recuperación de contraseña.
|
| Los usuarios de TAP Terminal se almacenan en MongoDB.
|
| Por esta razón, este modelo también utiliza MongoDB y NO la
| tabla SQL "password_reset_tokens" que Laravel crea por defecto.
|
| Colección:
|
|     password_reset_tokens
|
| Estructura:
|
|     email
|     token
|     created_at
|
|--------------------------------------------------------------------------
*/

class PasswordResetToken extends Model
{
    /*
    |--------------------------------------------------------------------------
    | CONEXIÓN
    |--------------------------------------------------------------------------
    */

    protected $connection = 'mongodb';


    /*
    |--------------------------------------------------------------------------
    | COLECCIÓN
    |--------------------------------------------------------------------------
    */

    protected $table = 'password_reset_tokens';


    /*
    |--------------------------------------------------------------------------
    | CAMPOS ASIGNABLES
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'email',
        'token',
        'created_at',
    ];


    /*
    |--------------------------------------------------------------------------
    | CASTS
    |--------------------------------------------------------------------------
    */

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }
}