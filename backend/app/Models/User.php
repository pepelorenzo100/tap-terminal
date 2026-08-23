<?php

namespace App\Models;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL
| USER MODEL
|--------------------------------------------------------------------------
|
| Modelo de usuarios de TAP Terminal.
|
| Los usuarios se almacenan en MongoDB.
|
| Este modelo también será utilizado por Laravel
| para realizar la autenticación.
|
|--------------------------------------------------------------------------
*/

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use MongoDB\Laravel\Auth\User as Authenticatable;

class User extends Authenticatable
{
    /*
    |--------------------------------------------------------------------------
    | TRAITS
    |--------------------------------------------------------------------------
    |
    | HasApiTokens
    | Permite generar tokens mediante Laravel Sanctum.
    |
    | HasFactory
    | Permite utilizar factories para pruebas.
    |
    | Notifiable
    | Permite utilizar las notificaciones de Laravel.
    |
    */

    use HasApiTokens, HasFactory, Notifiable;

    /*
    |--------------------------------------------------------------------------
    | MONGODB
    |--------------------------------------------------------------------------
    |
    | Colección donde se almacenarán los usuarios.
    |
    */

    protected $connection = 'mongodb';

    protected $table = 'users';

    /*
    |--------------------------------------------------------------------------
    | MASS ASSIGNMENT
    |--------------------------------------------------------------------------
    |
    | Campos permitidos al crear o actualizar usuarios.
    |
    */

    protected $fillable = [
        'code',
        'name',
        'email',
        'phone',
        'profile_photo',
        'password',
    ];

    /*
    |--------------------------------------------------------------------------
    | HIDDEN
    |--------------------------------------------------------------------------
    |
    | Nunca debemos devolver la contraseña mediante la API.
    |
    */

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /*
    |--------------------------------------------------------------------------
    | CASTS
    |--------------------------------------------------------------------------
    |
    | Laravel almacenará y devolverá estas propiedades
    | con el tipo correspondiente.
    |
    */

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
