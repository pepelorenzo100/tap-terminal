<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use MongoDB\Laravel\Auth\User as Authenticatable;
use App\Traits\Auditable;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL
| USER MODEL
|--------------------------------------------------------------------------
|
| Modelo principal de usuarios de TAP Terminal.
|
| Responsabilidades:
|
| - Representar usuarios almacenados en MongoDB.
| - Participar en la autenticación mediante Laravel Sanctum.
| - Generar tokens de autenticación.
| - Mantener el perfil personal del usuario.
| - Mantener las relaciones con perfiles de autorización.
|
|--------------------------------------------------------------------------
*/

class User extends Authenticatable
{
    /*
    |--------------------------------------------------------------------------
    | TRAITS
    |--------------------------------------------------------------------------
    */

    use HasApiTokens, HasFactory, Notifiable, Auditable;


    /*
    |--------------------------------------------------------------------------
    | MONGODB
    |--------------------------------------------------------------------------
    */

    protected $connection = 'mongodb';

    protected $table = 'users';


    /*
    |--------------------------------------------------------------------------
    | MASS ASSIGNMENT
    |--------------------------------------------------------------------------
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
    */

    protected $hidden = [
        'password',
        'remember_token',
    ];


    /*
    |--------------------------------------------------------------------------
    | CASTS
    |--------------------------------------------------------------------------
    */

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | PERFIL PERSONAL
    |--------------------------------------------------------------------------
    |
    | Relación uno a uno con Profile.php.
    |
    */

    public function profile(): HasOne
    {
        return $this->hasOne(
            Profile::class,
            'user_id',
            '_id'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | PERFILES DE AUTORIZACIÓN
    |--------------------------------------------------------------------------
    |
    | Relación uno a muchos con UserProfile.php.
    |
    */

    public function userProfiles(): HasMany
    {
        return $this->hasMany(
            UserProfile::class,
            'user_id',
            '_id'
        );
    }
}
