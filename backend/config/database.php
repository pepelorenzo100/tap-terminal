<?php

/*
|--------------------------------------------------------------------------
| TAP TERMINAL
| CONFIGURACIÓN DE BASE DE DATOS
|--------------------------------------------------------------------------
|
| Archivo:
|
|     config/database.php
|
| Tipo:
|
|     BACKEND - Laravel / PHP
|
| Base de datos principal:
|
|     MongoDB
|
| Base de datos del proyecto:
|
|     tap_terminal
|
|--------------------------------------------------------------------------
|
| RESPONSABILIDAD
|--------------------------------------------------------------------------
|
| Este archivo contiene la configuración de las conexiones de base
| de datos que puede utilizar Laravel.
|
| Para el proyecto TAP Terminal utilizamos principalmente MongoDB.
|
| Flujo de conexión:
|
|     Product.php
|          ↓
|     Laravel MongoDB Driver
|          ↓
|     config/database.php
|          ↓
|     variables del archivo .env
|          ↓
|     MongoDB
|
|--------------------------------------------------------------------------
*/

use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| CONFIGURACIÓN PRINCIPAL
|--------------------------------------------------------------------------
*/

return [

    /*
    |--------------------------------------------------------------------------
    | CONEXIÓN PREDETERMINADA
    |--------------------------------------------------------------------------
    |
    | Define qué conexión utilizará Laravel por defecto.
    |
    | El valor se obtiene del archivo:
    |
    |     .env
    |
    | Variable:
    |
    |     DB_CONNECTION
    |
    | Para TAP Terminal:
    |
    |     DB_CONNECTION=mongodb
    |
    | El valor "mongodb" también se utiliza como valor
    | predeterminado en caso de que DB_CONNECTION no exista.
    |
    |--------------------------------------------------------------------------
    */

    'default' => env(
        'DB_CONNECTION',
        'mongodb'
    ),

    /*
    |--------------------------------------------------------------------------
    | CONEXIONES DE BASE DE DATOS
    |--------------------------------------------------------------------------
    |
    | En esta sección se registran las diferentes bases de datos
    | que Laravel puede utilizar.
    |
    |--------------------------------------------------------------------------
    */

    'connections' => [

        /*
        |--------------------------------------------------------------------------
        | MONGODB
        |--------------------------------------------------------------------------
        |
        | CONEXIÓN PRINCIPAL DE TAP TERMINAL
        |
        | MongoDB es la base de datos utilizada por el módulo
        | de productos.
        |
        | Configuración local:
        |
        |     Host:
        |         127.0.0.1
        |
        |     Puerto:
        |         27017
        |
        |     Base de datos:
        |         tap_terminal
        |
        | Las variables se obtienen desde:
        |
        |     DB_URI
        |     DB_DATABASE
        |
        |--------------------------------------------------------------------------
        */

        'mongodb' => [

            /*
            |--------------------------------------------------------------------------
            | DRIVER
            |--------------------------------------------------------------------------
            |
            | Indica que Laravel utilizará el driver de MongoDB.
            |
            */

            'driver' => 'mongodb',

            /*
            |--------------------------------------------------------------------------
            | DSN
            |--------------------------------------------------------------------------
            |
            | DSN significa Data Source Name.
            |
            | Contiene la dirección utilizada para conectarse
            | con MongoDB.
            |
            | Ejemplo:
            |
            |     mongodb://127.0.0.1:27017
            |
            | La configuración real se obtiene desde:
            |
            |     DB_URI
            |
            */

            'dsn' => env(
                'DB_URI',
                'mongodb://127.0.0.1:27017'
            ),

            /*
            |--------------------------------------------------------------------------
            | DATABASE
            |--------------------------------------------------------------------------
            |
            | Define el nombre de la base de datos MongoDB.
            |
            | Para TAP Terminal:
            |
            |     tap_terminal
            |
            | La configuración real se obtiene desde:
            |
            |     DB_DATABASE
            |
            */

            'database' => env(
                'DB_DATABASE',
                'tap_terminal'
            ),
        ],

        /*
        |--------------------------------------------------------------------------
        | SQLITE
        |--------------------------------------------------------------------------
        |
        | Configuración estándar proporcionada por Laravel.
        |
        | NO es la base de datos principal de TAP Terminal.
        |
        | Se conserva para mantener la configuración estándar
        | del framework.
        |
        |--------------------------------------------------------------------------
        */

        'sqlite' => [

            'driver' => 'sqlite',

            'url' => env(
                'DB_URL'
            ),

            'database' => env(
                'DB_DATABASE',
                database_path('database.sqlite')
            ),

            'prefix' => '',

            'foreign_key_constraints' => env(
                'DB_FOREIGN_KEYS',
                true
            ),

            'busy_timeout' => null,

            'journal_mode' => null,

            'synchronous' => null,
        ],

        /*
        |--------------------------------------------------------------------------
        | MYSQL
        |--------------------------------------------------------------------------
        |
        | Configuración estándar de Laravel.
        |
        | Actualmente no es utilizada por el módulo de productos.
        |
        |--------------------------------------------------------------------------
        */

        'mysql' => [

            'driver' => 'mysql',

            'url' => env(
                'DB_URL'
            ),

            'host' => env(
                'DB_HOST',
                '127.0.0.1'
            ),

            'port' => env(
                'DB_PORT',
                '3306'
            ),

            'database' => env(
                'DB_DATABASE',
                'laravel'
            ),

            'username' => env(
                'DB_USERNAME',
                'root'
            ),

            'password' => env(
                'DB_PASSWORD',
                ''
            ),

            'unix_socket' => env(
                'DB_SOCKET',
                ''
            ),

            'charset' => env(
                'DB_CHARSET',
                'utf8mb4'
            ),

            'collation' => env(
                'DB_COLLATION',
                'utf8mb4_unicode_ci'
            ),

            'prefix' => '',

            'prefix_indexes' => true,

            'strict' => true,

            'engine' => null,

            'options' => extension_loaded('pdo_mysql')
                ? array_filter([

                    PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),

                ])
                : [],
        ],

        /*
        |--------------------------------------------------------------------------
        | MARIADB
        |--------------------------------------------------------------------------
        |
        | Configuración estándar de Laravel.
        |
        | Actualmente no es utilizada por el módulo de productos.
        |
        |--------------------------------------------------------------------------
        */

        'mariadb' => [

            'driver' => 'mariadb',

            'url' => env(
                'DB_URL'
            ),

            'host' => env(
                'DB_HOST',
                '127.0.0.1'
            ),

            'port' => env(
                'DB_PORT',
                '3306'
            ),

            'database' => env(
                'DB_DATABASE',
                'laravel'
            ),

            'username' => env(
                'DB_USERNAME',
                'root'
            ),

            'password' => env(
                'DB_PASSWORD',
                ''
            ),

            'unix_socket' => env(
                'DB_SOCKET',
                ''
            ),

            'charset' => env(
                'DB_CHARSET',
                'utf8mb4'
            ),

            'collation' => env(
                'DB_COLLATION',
                'utf8mb4_unicode_ci'
            ),

            'prefix' => '',

            'prefix_indexes' => true,

            'strict' => true,

            'engine' => null,

            'options' => extension_loaded('pdo_mysql')
                ? array_filter([

                    PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),

                ])
                : [],
        ],

        /*
        |--------------------------------------------------------------------------
        | POSTGRESQL
        |--------------------------------------------------------------------------
        |
        | Configuración estándar de Laravel.
        |
        | Actualmente no es utilizada por TAP Terminal.
        |
        |--------------------------------------------------------------------------
        */

        'pgsql' => [

            'driver' => 'pgsql',

            'url' => env(
                'DB_URL'
            ),

            'host' => env(
                'DB_HOST',
                '127.0.0.1'
            ),

            'port' => env(
                'DB_PORT',
                '5432'
            ),

            'database' => env(
                'DB_DATABASE',
                'laravel'
            ),

            'username' => env(
                'DB_USERNAME',
                'root'
            ),

            'password' => env(
                'DB_PASSWORD',
                ''
            ),

            'charset' => env(
                'DB_CHARSET',
                'utf8'
            ),

            'prefix' => '',

            'prefix_indexes' => true,

            'search_path' => 'public',

            'sslmode' => 'prefer',
        ],

        /*
        |--------------------------------------------------------------------------
        | SQL SERVER
        |--------------------------------------------------------------------------
        |
        | Configuración estándar de Laravel.
        |
        | Actualmente no es utilizada por TAP Terminal.
        |
        |--------------------------------------------------------------------------
        */

        'sqlsrv' => [

            'driver' => 'sqlsrv',

            'url' => env(
                'DB_URL'
            ),

            'host' => env(
                'DB_HOST',
                'localhost'
            ),

            'port' => env(
                'DB_PORT',
                '1433'
            ),

            'database' => env(
                'DB_DATABASE',
                'laravel'
            ),

            'username' => env(
                'DB_USERNAME',
                'root'
            ),

            'password' => env(
                'DB_PASSWORD',
                ''
            ),

            'charset' => env(
                'DB_CHARSET',
                'utf8'
            ),

            'prefix' => '',

            'prefix_indexes' => true,

            /*
             * Estas opciones pueden habilitarse cuando
             * sean necesarias para SQL Server.
             */

            // 'encrypt' => env(
            //     'DB_ENCRYPT',
            //     'yes'
            // ),

            // 'trust_server_certificate' => env(
            //     'DB_TRUST_SERVER_CERTIFICATE',
            //     'false'
            // ),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | MIGRACIONES
    |--------------------------------------------------------------------------
    |
    | Laravel utiliza esta configuración para registrar
    | las migraciones ejecutadas.
    |
    | IMPORTANTE:
    |
    | El CRUD de productos utiliza MongoDB.
    |
    | Esta configuración pertenece al mecanismo de migraciones
    | de Laravel y se conserva porque forma parte de la
    | configuración estándar del framework.
    |
    |--------------------------------------------------------------------------
    */

    'migrations' => [

        'table' => 'migrations',

        'update_date_on_publish' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | REDIS
    |--------------------------------------------------------------------------
    |
    | Redis es un sistema de almacenamiento en memoria.
    |
    | Actualmente no forma parte del CRUD de productos,
    | pero se conserva la configuración estándar de Laravel.
    |
    |--------------------------------------------------------------------------
    */

    'redis' => [

        /*
        |--------------------------------------------------------------------------
        | CLIENTE REDIS
        |--------------------------------------------------------------------------
        */

        'client' => env(
            'REDIS_CLIENT',
            'phpredis'
        ),

        /*
        |--------------------------------------------------------------------------
        | OPCIONES REDIS
        |--------------------------------------------------------------------------
        */

        'options' => [

            'cluster' => env(
                'REDIS_CLUSTER',
                'redis'
            ),

            'prefix' => env(
                'REDIS_PREFIX',
                Str::slug(
                    env(
                        'APP_NAME',
                        'laravel'
                    ),
                    '_'
                ).'_database_'
            ),
        ],

        /*
        |--------------------------------------------------------------------------
        | REDIS DEFAULT
        |--------------------------------------------------------------------------
        */

        'default' => [

            'url' => env(
                'REDIS_URL'
            ),

            'host' => env(
                'REDIS_HOST',
                '127.0.0.1'
            ),

            'username' => env(
                'REDIS_USERNAME'
            ),

            'password' => env(
                'REDIS_PASSWORD'
            ),

            'port' => env(
                'REDIS_PORT',
                '6379'
            ),

            'database' => env(
                'REDIS_DB',
                '0'
            ),
        ],

        /*
        |--------------------------------------------------------------------------
        | REDIS CACHE
        |--------------------------------------------------------------------------
        */

        'cache' => [

            'url' => env(
                'REDIS_URL'
            ),

            'host' => env(
                'REDIS_HOST',
                '127.0.0.1'
            ),

            'username' => env(
                'REDIS_USERNAME'
            ),

            'password' => env(
                'REDIS_PASSWORD'
            ),

            'port' => env(
                'REDIS_PORT',
                '6379'
            ),

            'database' => env(
                'REDIS_CACHE_DB',
                '1'
            ),
        ],
    ],
];
