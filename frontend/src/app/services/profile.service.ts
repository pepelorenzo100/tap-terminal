/*
|--------------------------------------------------------------------------
| TAP TERMINAL - PROFILE SERVICE
|--------------------------------------------------------------------------
|
| Archivo:
|
|     frontend/src/app/services/profile.service.ts
|
| Tipo:
|
|     FRONTEND - Angular / TypeScript
|
| Responsabilidad:
|
|     Centralizar las peticiones HTTP relacionadas con el perfil
|     del usuario autenticado.
|
| API:
|
|     GET    /api/profile
|     PUT    /api/profile
|     DELETE /api/profile
|
| Autenticación:
|
|     Las peticiones pasan por AuthInterceptor.
|
|     El interceptor agrega automáticamente:
|
|         Authorization: Bearer TOKEN
|
|--------------------------------------------------------------------------
*/

import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


/*
|--------------------------------------------------------------------------
| INTERFAZ PROFILE
|--------------------------------------------------------------------------
|
| Representa la información almacenada en la colección:
|
|     profiles
|
| de MongoDB.
|
|--------------------------------------------------------------------------
*/

export interface Profile {

  /*
  |--------------------------------------------------------------------------
  | IDENTIFICADORES
  |--------------------------------------------------------------------------
  */

  id?: string;

  user_id?: string;


  /*
  |--------------------------------------------------------------------------
  | INFORMACIÓN DE CONTACTO
  |--------------------------------------------------------------------------
  */

  phone?: string | null;

  address?: string | null;

  city?: string | null;

  state?: string | null;

  country?: string | null;

  postal_code?: string | null;


  /*
  |--------------------------------------------------------------------------
  | INFORMACIÓN PERSONAL
  |--------------------------------------------------------------------------
  */

  birth_date?: string | null;

  gender?: string | null;

  bio?: string | null;


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
| Laravel responde utilizando:
|
|     message
|     data
|
| Cuando todavía no existe un perfil:
|
|     data = null
|
|--------------------------------------------------------------------------
*/

export interface ProfileResponse {

  message: string;

  data: Profile | null;

}


/*
|--------------------------------------------------------------------------
| PROFILE SERVICE
|--------------------------------------------------------------------------
*/

@Injectable({
  providedIn: 'root'
})
export class ProfileService {


  /*
  |--------------------------------------------------------------------------
  | URL DE LA API
  |--------------------------------------------------------------------------
  |
  | Backend Laravel:
  |
  |     http://127.0.0.1:8000
  |
  | Endpoint:
  |
  |     /api/profile
  |
  |--------------------------------------------------------------------------
  */

  private readonly apiUrl =
    'http://127.0.0.1:8000/api/profile';


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
  | OBTENER PERFIL
  |--------------------------------------------------------------------------
  |
  | GET /api/profile
  |
  | Obtiene el perfil correspondiente al usuario autenticado.
  |
  |--------------------------------------------------------------------------
  */

  getProfile(): Observable<ProfileResponse> {

    return this.http.get<ProfileResponse>(
      this.apiUrl
    );

  }


  /*
  |--------------------------------------------------------------------------
  | ACTUALIZAR PERFIL
  |--------------------------------------------------------------------------
  |
  | PUT /api/profile
  |
  | Laravel crea el perfil si todavía no existe mediante
  | updateOrCreate().
  |
  |--------------------------------------------------------------------------
  */

  updateProfile(
    profile: Profile
  ): Observable<ProfileResponse> {

    return this.http.put<ProfileResponse>(
      this.apiUrl,
      profile
    );

  }


  /*
  |--------------------------------------------------------------------------
  | ELIMINAR PERFIL
  |--------------------------------------------------------------------------
  |
  | DELETE /api/profile
  |
  | Elimina únicamente el perfil del usuario autenticado.
  |
  |--------------------------------------------------------------------------
  */

  deleteProfile(): Observable<{ message: string }> {

    return this.http.delete<{ message: string }>(
      this.apiUrl
    );

  }

}