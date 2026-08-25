/*
|--------------------------------------------------------------------------
| TAP TERMINAL - USER SERVICE
|--------------------------------------------------------------------------
|
| Archivo:
|
|     frontend/src/app/services/user.service.ts
|
| Responsabilidad:
|
|     Centralizar toda la comunicación HTTP entre Angular y
|     Laravel para la administración de usuarios.
|
| Funcionalidades:
|
|     - Listar usuarios.
|     - Obtener un usuario.
|     - Crear usuarios.
|     - Actualizar usuarios.
|     - Eliminar usuarios.
|     - Construir URL pública de fotografías.
|     - Representar los perfiles de autorización asignados.
|
| API:
|
|     GET       /api/users
|     GET       /api/users/{id}
|     POST      /api/users
|     PUT/PATCH /api/users/{id}
|     DELETE    /api/users/{id}
|
| Autenticación:
|
|     AuthInterceptor
|         ↓
|     Authorization: Bearer TOKEN
|
| Backend:
|
|     Laravel
|         ↓
|     Sanctum
|         ↓
|     MongoDB
|
| Fotografías:
|
|     Laravel almacena únicamente la ruta relativa:
|
|         profile-photos/archivo.jpg
|
|     El navegador utiliza:
|
|         http://127.0.0.1:8000/storage/profile-photos/archivo.jpg
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| IMPORTACIONES ANGULAR
|--------------------------------------------------------------------------
*/

import {
  Injectable
} from '@angular/core';


/*
|--------------------------------------------------------------------------
| HTTP CLIENT
|--------------------------------------------------------------------------
*/

import {
  HttpClient
} from '@angular/common/http';


/*
|--------------------------------------------------------------------------
| RXJS
|--------------------------------------------------------------------------
*/

import {
  Observable
} from 'rxjs';


/*
|--------------------------------------------------------------------------
| MODELO DE USUARIO
|--------------------------------------------------------------------------
|
| Representa la estructura que Laravel devuelve para un usuario.
|
|--------------------------------------------------------------------------
*/

export interface User {


  /*
  |--------------------------------------------------------------------------
  | IDENTIFICADOR
  |--------------------------------------------------------------------------
  |
  | Identificador MongoDB.
  |
  */

  id?: string;


  /*
  |--------------------------------------------------------------------------
  | CÓDIGO
  |--------------------------------------------------------------------------
  |
  | Código generado automáticamente por Laravel.
  |
  | Ejemplo:
  |
  |     USR-000001
  |
  */

  code?: string;


  /*
  |--------------------------------------------------------------------------
  | INFORMACIÓN BÁSICA
  |--------------------------------------------------------------------------
  */

  name: string;

  email: string;

  phone?: string | null;


  /*
  |--------------------------------------------------------------------------
  | FOTOGRAFÍA DE PERFIL
  |--------------------------------------------------------------------------
  |
  | Laravel almacena una ruta relativa.
  |
  | Ejemplo:
  |
  |     profile-photos/abc123.jpg
  |
  */

  profile_photo?: string | null;


  /*
  |--------------------------------------------------------------------------
  | PERFILES DE AUTORIZACIÓN
  |--------------------------------------------------------------------------
  |
  | El backend agrega esta propiedad mediante:
  |
  |     getUserProfiles()
  |
  | Ejemplo:
  |
  |     [
  |       {
  |         id: "...",
  |         code: "PRF-ADMIN",
  |         name: "Administrador",
  |         description: "Acceso completo al sistema."
  |       }
  |     ]
  |
  | Un usuario puede tener uno o varios perfiles.
  |
  */

  profiles?: UserAccessProfile[];


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
| PERFIL DE AUTORIZACIÓN ASIGNADO AL USUARIO
|--------------------------------------------------------------------------
|
| Esta estructura corresponde exactamente a la información que
| UserController::getUserProfiles() prepara para Angular.
|
|--------------------------------------------------------------------------
*/

export interface UserAccessProfile {


  /*
  |--------------------------------------------------------------------------
  | IDENTIFICADOR DEL PERFIL
  |--------------------------------------------------------------------------
  */

  id: string;


  /*
  |--------------------------------------------------------------------------
  | CÓDIGO DEL PERFIL
  |--------------------------------------------------------------------------
  |
  | Ejemplos:
  |
  |     PRF-ADMIN
  |     PRF-OPERATOR
  |
  */

  code: string;


  /*
  |--------------------------------------------------------------------------
  | NOMBRE
  |--------------------------------------------------------------------------
  */

  name: string;


  /*
  |--------------------------------------------------------------------------
  | DESCRIPCIÓN
  |--------------------------------------------------------------------------
  */

  description: string | null;

}


/*
|--------------------------------------------------------------------------
| RESPUESTA DE LA API
|--------------------------------------------------------------------------
|
| Laravel utiliza:
|
|     {
|         message: "...",
|         data: ...
|     }
|
| Dependiendo del endpoint:
|
|     data = User
|
| o:
|
|     data = User[]
|
|--------------------------------------------------------------------------
*/

export interface UserResponse {

  message: string;

  data: User | User[];

}


/*
|--------------------------------------------------------------------------
| RESPUESTA DE ELIMINACIÓN
|--------------------------------------------------------------------------
*/

export interface UserDeleteResponse {

  message: string;

}


/*
|--------------------------------------------------------------------------
| SERVICIO DE USUARIOS
|--------------------------------------------------------------------------
*/

@Injectable({
  providedIn: 'root'
})
export class UserService {


  /*
  |--------------------------------------------------------------------------
  | URL BASE DEL BACKEND
  |--------------------------------------------------------------------------
  |
  | Backend Laravel:
  |
  |     http://127.0.0.1:8000
  |
  |--------------------------------------------------------------------------
  */

  private readonly apiBaseUrl =
    'http://127.0.0.1:8000';


  /*
  |--------------------------------------------------------------------------
  | URL DE LA API DE USUARIOS
  |--------------------------------------------------------------------------
  */

  private readonly apiUrl =
    `${this.apiBaseUrl}/api/users`;


  /*
  |--------------------------------------------------------------------------
  | CONSTRUCTOR
  |--------------------------------------------------------------------------
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
  | El backend devuelve todos los usuarios y agrega:
  |
  |     profiles
  |
  | a cada usuario.
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
  | OBTENER USUARIO
  |--------------------------------------------------------------------------
  |
  | GET /api/users/{id}
  |
  | El backend devuelve:
  |
  |     data.user
  |
  | junto con:
  |
  |     data.profiles
  |
  |--------------------------------------------------------------------------
  */

  getUser(
    id: string
  ): Observable<UserResponse> {

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
  | Content-Type:
  |
  |     multipart/form-data
  |
  | El FormData puede contener:
  |
  |     name
  |     email
  |     phone
  |     password
  |     profile_photo
  |     profile_ids[]
  |
  | IMPORTANTE:
  |
  | El frontend NO genera el código USR-XXXXXX.
  |
  | Laravel lo genera automáticamente.
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
  | POST /api/users/{id}
  |
  | Se agrega:
  |
  |     _method=PUT
  |
  | Laravel interpreta la petición como:
  |
  |     PUT /api/users/{id}
  |
  | El FormData puede contener:
  |
  |     name
  |     email
  |     phone
  |     password
  |     profile_photo
  |     profile_ids[]
  |
  | Los perfiles enviados reemplazan las asignaciones anteriores.
  |
  |--------------------------------------------------------------------------
  */

  updateUser(
    id: string,
    formData: FormData
  ): Observable<UserResponse> {

    /*
    |--------------------------------------------------------------------------
    | MÉTODO HTTP DE LARAVEL
    |--------------------------------------------------------------------------
    */

    formData.set(
      '_method',
      'PUT'
    );


    /*
    |--------------------------------------------------------------------------
    | PETICIÓN
    |--------------------------------------------------------------------------
    */

    return this.http.post<UserResponse>(
      `${this.apiUrl}/${id}`,
      formData
    );

  }


  /*
  |--------------------------------------------------------------------------
  | ELIMINAR USUARIO
  |--------------------------------------------------------------------------
  |
  | DELETE /api/users/{id}
  |
  | Laravel elimina:
  |
  |     - fotografía;
  |     - relaciones UserProfile;
  |     - usuario.
  |
  |--------------------------------------------------------------------------
  */

  deleteUser(
    id: string
  ): Observable<UserDeleteResponse> {

    return this.http.delete<UserDeleteResponse>(
      `${this.apiUrl}/${id}`
    );

  }


  /*
  |--------------------------------------------------------------------------
  | OBTENER URL PÚBLICA DE LA FOTOGRAFÍA
  |--------------------------------------------------------------------------
  |
  | Entrada:
  |
  |     profile-photos/archivo.jpg
  |
  | Resultado:
  |
  |     http://127.0.0.1:8000/storage/profile-photos/archivo.jpg
  |
  | También se contemplan:
  |
  |     - URL absoluta.
  |     - Ruta con "/" inicial.
  |     - Ruta que ya contiene "storage/".
  |
  |--------------------------------------------------------------------------
  */

  getProfilePhotoUrl(
    profilePhoto:
      string |
      null |
      undefined
  ): string {


    /*
    |--------------------------------------------------------------------------
    | SIN FOTOGRAFÍA
    |--------------------------------------------------------------------------
    */

    if (!profilePhoto) {

      return '';

    }


    /*
    |--------------------------------------------------------------------------
    | LIMPIAR ESPACIOS
    |--------------------------------------------------------------------------
    */

    const photo =
      profilePhoto.trim();


    if (!photo) {

      return '';

    }


    /*
    |--------------------------------------------------------------------------
    | URL ABSOLUTA
    |--------------------------------------------------------------------------
    |
    | Si Laravel ya devuelve una URL completa,
    | no debemos modificarla.
    |
    */

    if (

      photo.startsWith(
        'http://'
      ) ||

      photo.startsWith(
        'https://'
      )

    ) {

      return photo;

    }


    /*
    |--------------------------------------------------------------------------
    | NORMALIZAR SLASH INICIAL
    |--------------------------------------------------------------------------
    */

    const normalizedPath =
      photo.replace(
        /^\/+/,
        ''
      );


    /*
    |--------------------------------------------------------------------------
    | RUTA QUE YA CONTIENE STORAGE
    |--------------------------------------------------------------------------
    */

    if (
      normalizedPath.startsWith(
        'storage/'
      )
    ) {

      return `${this.apiBaseUrl}/${normalizedPath}`;

    }


    /*
    |--------------------------------------------------------------------------
    | RUTA NORMAL
    |--------------------------------------------------------------------------
    */

    return `${this.apiBaseUrl}/storage/${normalizedPath}`;

  }

}