<?php

// Indicamos el espacio de nombres al que pertenece este controlador.
namespace App\Http\Controllers\Api;

// Importamos Request para recibir información enviada mediante HTTP.
use Illuminate\Http\Request;

// Importamos el modelo User para trabajar con la tabla de usuarios.
use App\Models\User;

// Importamos Rule para crear reglas de validación avanzadas.
use Illuminate\Validation\Rule;

// Importamos Hash para proteger las contraseñas.
use Illuminate\Support\Facades\Hash;


// Declaramos nuestro controlador de usuarios.
class UserController
{
    /**
     * GET /api/users
     *
     * Obtiene todos los usuarios registrados.
     */
    public function index()
    {
        // Consultamos todos los usuarios de la base de datos.
        $users = User::all();

        // Ocultamos la contraseña por seguridad,
        // incluso si el modelo User no la tuviera configurada como hidden.
        $users->makeHidden(['password']);

        // Devolvemos una respuesta HTTP en formato JSON.
        return response()->json([
            // Mensaje descriptivo de la operación.
            'message' => 'Usuarios obtenidos correctamente.',

            // Lista de usuarios encontrada.
            'data' => $users,
        ], 200);
    }


    /**
     * POST /api/users
     *
     * Crea un nuevo usuario.
     */
    public function store(Request $request)
    {
        // Validamos los datos enviados por el cliente.
        $validated = $request->validate([

            // El nombre es obligatorio.
            // Debe ser texto y tener como máximo 255 caracteres.
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            // El correo es obligatorio.
            // Debe tener formato de correo electrónico.
            // No puede superar 255 caracteres.
            // Además, no puede estar registrado previamente.
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            // La contraseña es obligatoria.
            // Debe ser texto y tener al menos 8 caracteres.
            'password' => [
                'required',
                'string',
                'min:8',
            ],
        ]);

        // Convertimos la contraseña en un hash seguro.
        //
        // IMPORTANTE:
        // Nunca debemos guardar contraseñas directamente como texto plano.
        $validated['password'] = Hash::make($validated['password']);

        // Creamos el usuario utilizando únicamente los datos validados.
        $user = User::create($validated);

        // Ocultamos la contraseña antes de devolver la respuesta.
        $user->makeHidden(['password']);

        // Devolvemos HTTP 201 porque se creó un recurso nuevo.
        return response()->json([
            // Mensaje descriptivo.
            'message' => 'Usuario creado correctamente.',

            // Información del usuario creado.
            'data' => $user,
        ], 201);
    }


    /**
     * GET /api/users/{id}
     *
     * Obtiene un usuario específico mediante su ID.
     */
    public function show(int $id)
    {
        // Buscamos el usuario por su ID.
        //
        // findOrFail() tiene un comportamiento importante:
        // si encuentra el usuario, continúa normalmente.
        // si NO lo encuentra, Laravel devuelve HTTP 404.
        $user = User::findOrFail($id);

        // Ocultamos la contraseña antes de enviar el usuario.
        $user->makeHidden(['password']);

        // Devolvemos el usuario encontrado.
        return response()->json([
            // Mensaje descriptivo.
            'message' => 'Usuario obtenido correctamente.',

            // Usuario encontrado.
            'data' => $user,
        ], 200);
    }


    /**
     * PUT /api/users/{id}
     *
     * Actualiza un usuario existente.
     */
    public function update(Request $request, int $id)
    {
        // Buscamos el usuario que queremos modificar.
        //
        // Si el ID no existe, Laravel devuelve HTTP 404.
        $user = User::findOrFail($id);

        // Validamos los datos recibidos.
        $validated = $request->validate([

            // El nombre es obligatorio.
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            // El correo es obligatorio y debe ser válido.
            //
            // Rule::unique() verifica que no exista otro usuario
            // utilizando el mismo correo.
            //
            // ignore($user->id) permite que el usuario conserve
            // su propio correo al actualizarse.
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],

            // La contraseña NO es obligatoria al actualizar.
            //
            // Si no se envía, conservaremos la contraseña actual.
            //
            // Si se envía, deberá tener mínimo 8 caracteres.
            'password' => [
                'nullable',
                'string',
                'min:8',
            ],
        ]);

        // Comprobamos si el cliente proporcionó una nueva contraseña.
        if (!empty($validated['password'])) {

            // Convertimos la nueva contraseña en un hash seguro.
            $validated['password'] = Hash::make(
                $validated['password']
            );

        } else {

            // Si no enviaron contraseña,
            // eliminamos el campo para conservar la contraseña actual.
            unset($validated['password']);
        }

        // Actualizamos únicamente los datos validados.
        $user->update($validated);

        // Ocultamos la contraseña antes de devolver el resultado.
        $user->makeHidden(['password']);

        // Devolvemos HTTP 200 porque la actualización fue correcta.
        return response()->json([
            // Mensaje descriptivo.
            'message' => 'Usuario actualizado correctamente.',

            // Usuario después de la actualización.
            'data' => $user,
        ], 200);
    }


    /**
     * DELETE /api/users/{id}
     *
     * Elimina un usuario existente.
     */
    public function destroy(int $id)
    {
        // Buscamos el usuario mediante su ID.
        //
        // Si no existe, Laravel devuelve HTTP 404.
        $user = User::findOrFail($id);

        // Eliminamos el usuario de la base de datos.
        $user->delete();

        // Devolvemos un mensaje confirmando la eliminación.
        return response()->json([
            'message' => 'Usuario eliminado correctamente.',
        ], 200);
    }
}