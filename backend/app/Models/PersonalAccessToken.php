<?php

namespace App\Models;

/*
|--------------------------------------------------------------------------
| TAP TERMINAL
| PERSONAL ACCESS TOKEN
|--------------------------------------------------------------------------
|
| Este modelo adapta el modelo de tokens de Laravel Sanctum
| para trabajar correctamente con MongoDB.
|
| Sanctum originalmente utiliza un modelo Eloquent pensado
| para bases de datos relacionales.
|
| DocumentModel permite que este modelo sea compatible
| con MongoDB.
|
|--------------------------------------------------------------------------
*/

use Laravel\Sanctum\PersonalAccessToken as SanctumToken;
use MongoDB\Laravel\Eloquent\DocumentModel;

class PersonalAccessToken extends SanctumToken
{
    /*
    |--------------------------------------------------------------------------
    | DOCUMENT MODEL
    |--------------------------------------------------------------------------
    |
    | Permite utilizar MongoDB como almacenamiento del token.
    |
    */

    use DocumentModel;

    /*
    |--------------------------------------------------------------------------
    | CONEXIÓN
    |--------------------------------------------------------------------------
    |
    | Indicamos que los tokens de Sanctum se almacenarán
    | en nuestra conexión MongoDB.
    |
    */

    protected $connection = 'mongodb';

    /*
    |--------------------------------------------------------------------------
    | COLECCIÓN
    |--------------------------------------------------------------------------
    |
    | MongoDB almacenará los tokens en:
    |
    | personal_access_tokens
    |
    */

    protected $table = 'personal_access_tokens';

    /*
    |--------------------------------------------------------------------------
    | TIPO DE ID
    |--------------------------------------------------------------------------
    |
    | MongoDB utiliza ObjectId/string como identificador.
    |
    */

    protected $keyType = 'string';
}
