<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use MongoDB\Laravel\Eloquent\Model;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL
| USER PROFILE MODEL
|--------------------------------------------------------------------------
|
| Relaciona un usuario con un perfil de autorización.
|
| Ejemplo:
|
|     User
|       ↓
|     UserProfile
|       ↓
|     AccessProfile
|
|--------------------------------------------------------------------------
*/

class UserProfile extends Model
{
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

    protected $table = 'user_profiles';


    /*
    |--------------------------------------------------------------------------
    | CAMPOS
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'user_id',
        'profile_id',
    ];


    /*
    |--------------------------------------------------------------------------
    | USUARIO
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id',
            '_id'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | PERFIL DE AUTORIZACIÓN
    |--------------------------------------------------------------------------
    */

    public function accessProfile(): BelongsTo
    {
        return $this->belongsTo(
            AccessProfile::class,
            'profile_id',
            '_id'
        );
    }
}