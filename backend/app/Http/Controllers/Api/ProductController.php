<?php

/*
|--------------------------------------------------------------------------
| TAP TERMINAL
| PRODUCT CONTROLLER
|--------------------------------------------------------------------------
|
| Archivo:
| app/Http/Controllers/Api/ProductController.php
|
| Tipo:
| BACKEND - Laravel / PHP
|
| Responsabilidad:
|
| Este controlador administra las operaciones CRUD de productos
| mediante la API REST de Laravel.
|
| Flujo de comunicación:
|
| Angular
|    ↓
| ProductService
|    ↓
| HTTP Request
|    ↓
| routes/api.php
|    ↓
| ProductController
|    ↓
| Product Model
|    ↓
| MongoDB
|
|--------------------------------------------------------------------------
|
| ENDPOINT PRINCIPAL:
|
|     /api/products
|
| OPERACIONES:
|
|     GET       /api/products
|     POST      /api/products
|     GET       /api/products/{id}
|     PUT       /api/products/{id}
|     PATCH     /api/products/{id}
|     DELETE    /api/products/{id}
|
|--------------------------------------------------------------------------
*/

namespace App\Http\Controllers\Api;


/*
|--------------------------------------------------------------------------
| CONTROLADOR BASE DE LARAVEL
|--------------------------------------------------------------------------
|
| Permite que este controlador herede el comportamiento
| estándar de los controladores Laravel.
|
*/

use App\Http\Controllers\Controller;


/*
|--------------------------------------------------------------------------
| MODELO PRODUCT
|--------------------------------------------------------------------------
|
| Representa los productos almacenados en MongoDB.
|
*/

use App\Models\Product;


/*
|--------------------------------------------------------------------------
| JSON RESPONSE
|--------------------------------------------------------------------------
|
| Se utiliza para indicar que los métodos del controlador
| devuelven respuestas JSON.
|
*/

use Illuminate\Http\JsonResponse;


/*
|--------------------------------------------------------------------------
| HTTP REQUEST
|--------------------------------------------------------------------------
|
| Contiene los datos enviados por Angular mediante
| las solicitudes HTTP.
|
*/

use Illuminate\Http\Request;


/**
 * ============================================================
 * PRODUCT CONTROLLER
 * ============================================================
 *
 * Controlador REST para administrar productos.
 *
 * Este controlador NO genera directamente el código
 * del producto.
 *
 * La generación automática del código corresponde
 * al modelo:
 *
 *     App\Models\Product
 *
 * ============================================================
 */

class ProductController extends Controller
{

    /**
     * ========================================================
     * LISTAR PRODUCTOS
     * ========================================================
     *
     * Método:
     *
     *     GET
     *
     * Endpoint:
     *
     *     /api/products
     *
     * Objetivo:
     *
     * Obtener todos los productos almacenados en MongoDB.
     *
     * Flujo:
     *
     * Angular
     *    ↓
     * GET /api/products
     *    ↓
     * index()
     *    ↓
     * Product::all()
     *    ↓
     * MongoDB
     *
     * ========================================================
     */

    public function index(): JsonResponse
    {

        /*
        |--------------------------------------------------------------------------
        | OBTENER PRODUCTOS
        |--------------------------------------------------------------------------
        |
        | Product::all() consulta todos los documentos
        | disponibles en la colección "products".
        |
        */

        $products = Product::all();


        /*
        |--------------------------------------------------------------------------
        | RESPUESTA JSON
        |--------------------------------------------------------------------------
        |
        | Laravel convierte automáticamente la colección
        | de productos a JSON.
        |
        | HTTP 200:
        |
        | La solicitud fue procesada correctamente.
        |
        */

        return response()->json($products);
    }


    /**
     * ========================================================
     * CREAR PRODUCTO
     * ========================================================
     *
     * Método:
     *
     *     POST
     *
     * Endpoint:
     *
     *     /api/products
     *
     * Datos esperados:
     *
     *     name
     *     brand
     *     price
     *
     * IMPORTANTE:
     *
     * El frontend NO envía:
     *
     *     id
     *     code
     *     created_at
     *     updated_at
     *
     * Estos valores son administrados por el backend.
     *
     * ========================================================
     */

    public function store(Request $request): JsonResponse
    {

        /*
        |--------------------------------------------------------------------------
        | VALIDACIÓN DE DATOS
        |--------------------------------------------------------------------------
        |
        | name:
        | Obligatorio.
        | Debe ser texto.
        | Máximo 100 caracteres.
        |
        | brand:
        | Obligatorio.
        | Debe ser texto.
        | Máximo 100 caracteres.
        |
        | price:
        | Obligatorio.
        | Debe ser numérico.
        | Mínimo 0.
        | Máximo 999.99.
        |
        */

        $validated = $request->validate([

            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'brand' => [
                'required',
                'string',
                'max:100',
            ],

            'price' => [
                'required',
                'numeric',
                'min:0',
                'max:999.99',
            ],

        ]);


        /*
        |--------------------------------------------------------------------------
        | CREAR PRODUCTO
        |--------------------------------------------------------------------------
        |
        | Product::create() utiliza los campos permitidos
        | definidos en:
        |
        | Product::$fillable
        |
        | El modelo Product genera automáticamente
        | el código del producto mediante su evento
        | "creating".
        |
        */

        $product = Product::create($validated);


        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        |
        | HTTP 201:
        |
        | El recurso fue creado correctamente.
        |
        */

        return response()->json(

            $product,

            201

        );
    }


    /**
     * ========================================================
     * MOSTRAR PRODUCTO
     * ========================================================
     *
     * Método:
     *
     *     GET
     *
     * Endpoint:
     *
     *     /api/products/{id}
     *
     * Objetivo:
     *
     * Obtener un producto específico.
     *
     * ========================================================
     */

    public function show(string $id): JsonResponse
    {

        /*
        |--------------------------------------------------------------------------
        | BUSCAR PRODUCTO
        |--------------------------------------------------------------------------
        |
        | find() busca el documento utilizando
        | el identificador proporcionado.
        |
        */

        $product = Product::find($id);


        /*
        |--------------------------------------------------------------------------
        | PRODUCTO NO ENCONTRADO
        |--------------------------------------------------------------------------
        |
        | Si MongoDB no encuentra el documento,
        | devolvemos HTTP 404.
        |
        */

        if (!$product) {

            return response()->json([

                'message' => 'Producto no encontrado.',

            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | PRODUCTO ENCONTRADO
        |--------------------------------------------------------------------------
        |
        | Devolvemos el documento encontrado.
        |
        */

        return response()->json($product);
    }


    /**
     * ========================================================
     * ACTUALIZAR PRODUCTO
     * ========================================================
     *
     * Métodos:
     *
     *     PUT
     *     PATCH
     *
     * Endpoint:
     *
     *     /api/products/{id}
     *
     * Campos modificables:
     *
     *     name
     *     brand
     *     price
     *
     * El campo "code" NO puede modificarse.
     *
     * ========================================================
     */

    public function update(
        Request $request,
        string $id
    ): JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | BUSCAR PRODUCTO
        |--------------------------------------------------------------------------
        */

        $product = Product::find($id);


        /*
        |--------------------------------------------------------------------------
        | PRODUCTO NO ENCONTRADO
        |--------------------------------------------------------------------------
        */

        if (!$product) {

            return response()->json([

                'message' => 'Producto no encontrado.',

            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDACIÓN
        |--------------------------------------------------------------------------
        |
        | "sometimes" significa que el campo puede no venir
        | en la solicitud.
        |
        | Sin embargo, si viene incluido, debe cumplir
        | todas las reglas establecidas.
        |
        */

        $validated = $request->validate([

            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'brand' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'price' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
                'max:999.99',
            ],

        ]);


        /*
        |--------------------------------------------------------------------------
        | ACTUALIZAR
        |--------------------------------------------------------------------------
        |
        | Solamente se actualizan los campos que fueron
        | validados anteriormente.
        |
        | El código queda intacto.
        |
        */

        $product->update($validated);


        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        |
        | HTTP 200:
        |
        | Producto actualizado correctamente.
        |
        */

        return response()->json($product);
    }


    /**
     * ========================================================
     * ELIMINAR PRODUCTO
     * ========================================================
     *
     * Método:
     *
     *     DELETE
     *
     * Endpoint:
     *
     *     /api/products/{id}
     *
     * Objetivo:
     *
     * Eliminar un producto de MongoDB.
     *
     * ========================================================
     */

    public function destroy(string $id): JsonResponse
    {

        /*
        |--------------------------------------------------------------------------
        | BUSCAR PRODUCTO
        |--------------------------------------------------------------------------
        */

        $product = Product::find($id);


        /*
        |--------------------------------------------------------------------------
        | PRODUCTO NO ENCONTRADO
        |--------------------------------------------------------------------------
        */

        if (!$product) {

            return response()->json([

                'message' => 'Producto no encontrado.',

            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | ELIMINAR
        |--------------------------------------------------------------------------
        |
        | delete() elimina el documento correspondiente
        | de MongoDB.
        |
        */

        $product->delete();


        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        |
        | HTTP 200:
        |
        | Operación realizada correctamente.
        |
        */

        return response()->json([

            'message' => 'Producto eliminado correctamente.',

        ]);
    }
}