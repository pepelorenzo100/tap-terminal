/*
|--------------------------------------------------------------------------
| TAP TERMINAL - USER SERVICE
|--------------------------------------------------------------------------
|
| Archivo:
|
| frontend/src/app/services/user.service.ts
|
| Tipo:
|
| FRONTEND - Angular / TypeScript
|
| Responsabilidad:
|
| Este servicio centraliza las peticiones HTTP relacionadas
| con los usuarios del sistema.
|
| Comunicación:
|
| Angular
|    ↓
| UserService
|    ↓
| HttpClient
|    ↓
| AuthInterceptor
|    ↓
| Authorization: Bearer TOKEN
|    ↓
| Laravel API
|    ↓
| UserController
|    ↓
| User Model
|    ↓
| MongoDB
|
|--------------------------------------------------------------------------
| ENDPOINT PRINCIPAL
|--------------------------------------------------------------------------
|
|     /api/users
|
| Operaciones disponibles:
|
|     GET       /api/users
|     POST      /api/users
|     GET       /api/users/{id}
|     PUT/PATCH /api/users/{id}
|     DELETE    /api/users/{id}
|
|--------------------------------------------------------------------------
| AUTENTICACIÓN
|--------------------------------------------------------------------------
|
| Las rutas de usuarios están protegidas mediante:
|
|     auth:sanctum
|
| Por lo tanto, el AuthInterceptor debe agregar
| automáticamente el token Bearer a las peticiones.
|
|--------------------------------------------------------------------------
*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


/*
|--------------------------------------------------------------------------
| INTERFAZ USER
|--------------------------------------------------------------------------
|
| Representa la información básica de un usuario recibida
| desde Laravel.
|
| No incluimos la contraseña porque nunca debe utilizarse
| en la respuesta normal de la API.
|
|--------------------------------------------------------------------------
*/

export interface User {

  /*
  |--------------------------------------------------------------------------
  | IDENTIFICADOR
  |--------------------------------------------------------------------------
  */

  _id?: string;

  /*
  |--------------------------------------------------------------------------
  | CÓDIGO DEL USUARIO
  |--------------------------------------------------------------------------
  |
  | Ejemplo:
  |
  |     USR-000001
  |
  */

  code?: string;

  /*
  |--------------------------------------------------------------------------
  | DATOS PERSONALES
  |--------------------------------------------------------------------------
  */

  name: string;

  email: string;

  phone?: string | null;

  /*
  |--------------------------------------------------------------------------
  | FOTO DE PERFIL
  |--------------------------------------------------------------------------
  |
  | Laravel almacena la ruta de la fotografía.
  |
  */

  profile_photo?: string | null;

  /*
  |--------------------------------------------------------------------------
  | FECHAS
  |--------------------------------------------------------------------------
  */

  created_at?: string;

  updated_at?: string;
}


/*
|--------------------------------------------------------------------------
| RESPUESTA DE LA API
|--------------------------------------------------------------------------
|
| UserController devuelve las respuestas utilizando:
|
|     message
|     data
|
| Por ejemplo:
|
| {
|     "message": "Usuarios obtenidos correctamente.",
|     "data": [...]
| }
|
|--------------------------------------------------------------------------
*/

export interface UserResponse {

  message: string;

  data: User | User[];
}


/*
|--------------------------------------------------------------------------
| USER SERVICE
|--------------------------------------------------------------------------
|
| Injectable permite que Angular pueda utilizar este servicio
| mediante inyección de dependencias.
|
| providedIn: 'root'
|
| significa que Angular crea una única instancia del servicio
| disponible para toda la aplicación.
|
|--------------------------------------------------------------------------
*/

@Injectable({
  providedIn: 'root'
})
export class UserService {

  /*
  |--------------------------------------------------------------------------
  | URL DE LA API
  |--------------------------------------------------------------------------
  |
  | Esta URL apunta al backend Laravel ejecutándose localmente.
  |
  | Backend:
  |
  |     http://127.0.0.1:8000
  |
  | API:
  |
  |     /api/users
  |
  |--------------------------------------------------------------------------
  */

  private readonly apiUrl =
    'http://127.0.0.1:8000/api/users';


  /*
  |--------------------------------------------------------------------------
  | CONSTRUCTOR
  |--------------------------------------------------------------------------
  |
  | Angular proporciona automáticamente HttpClient.
  |
  */

  constructor(
    private readonly http: HttpClient
  ) {}


  /*
  |--------------------------------------------------------------------------
  | LISTAR USUARIOS
  |--------------------------------------------------------------------------
  |
  | GET /api/users
  |
  | Obtiene todos los usuarios registrados.
  |
  | La petición pasa por AuthInterceptor, que debe agregar
  | el token Bearer cuando exista una sesión autenticada.
  |
  |--------------------------------------------------------------------------
  */

  getUsers(): Observable<UserResponse> {

    return this.http.get<UserResponse>(
      this.apiUrl
    );
  }


  /*
  |--------------------------------------------------------------------------
  | OBTENER UN USUARIO
  |--------------------------------------------------------------------------
  |
  | GET /api/users/{id}
  |
  | Obtiene un usuario específico mediante su identificador.
  |
  |--------------------------------------------------------------------------
  */

  getUser(id: string): Observable<UserResponse> {

    return this.http.get<UserResponse>(
      `${this.apiUrl}/${id}`
    );
  }


  /*
  |--------------------------------------------------------------------------
  | CREAR USUARIO
  |--------------------------------------------------------------------------
  |
  | POST /api/users
  |
  | IMPORTANTE:
  |
  | UserController espera:
  |
  |     multipart/form-data
  |
  | porque permite enviar una fotografía de perfil.
  |
  | Por eso recibimos FormData y NO JSON.
  |
  |--------------------------------------------------------------------------
  */

  createUser(
    formData: FormData
  ): Observable<UserResponse> {

    return this.http.post<UserResponse>(
      this.apiUrl,
      formData
    );
  }


  /*
  |--------------------------------------------------------------------------
  | ACTUALIZAR USUARIO
  |--------------------------------------------------------------------------
  |
  | PUT /api/users/{id}
  |
  | También utilizamos FormData porque el usuario
  | puede cambiar su fotografía de perfil.
  |
  |--------------------------------------------------------------------------
  */

  updateUser(
    id: string,
    formData: FormData
  ): Observable<UserResponse> {

    return this.http.post<UserResponse>(
      `${this.apiUrl}/${id}`,
      this.addMethodOverride(
        formData,
        'PUT'
      )
    );
  }


  /*
  |--------------------------------------------------------------------------
  | ELIMINAR USUARIO
  |--------------------------------------------------------------------------
  |
  | DELETE /api/users/{id}
  |
  |--------------------------------------------------------------------------
  */

  deleteUser(
    id: string
  ): Observable<{ message: string }> {

    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }


  /*
  |--------------------------------------------------------------------------
  | METHOD OVERRIDE
  |--------------------------------------------------------------------------
  |
  | Cuando enviamos archivos mediante multipart/form-data,
  | algunos clientes y servidores pueden tener problemas
  | enviando PUT directamente.
  |
  | Laravel permite utilizar:
  |
  |     _method=PUT
  |
  | Por eso agregamos este campo al FormData.
  |
  |--------------------------------------------------------------------------
  */

  private addMethodOverride(
    formData: FormData,
    method: 'PUT' | 'PATCH'
  ): FormData {

    formData.set(
      '_method',
      method
    );

    return formData;
  }
}