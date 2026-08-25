/*
|--------------------------------------------------------------------------
| TAP TERMINAL - PROFILE COMPONENT
|--------------------------------------------------------------------------
|
| Archivo:
|
|     frontend/src/app/pages/profile/profile.component.ts
|
| Tipo:
|
|     FRONTEND - Angular / TypeScript
|
| Responsabilidad:
|
|     Administrar la información del perfil del usuario autenticado.
|
| Funcionalidades:
|
|     - Cargar el perfil.
|     - Mostrar la información actual.
|     - Mostrar la fotografía del usuario autenticado.
|     - Editar los datos del perfil.
|     - Guardar los cambios.
|     - Eliminar el perfil.
|     - Mostrar mensajes de éxito, error e información.
|     - Controlar los estados de carga y operación.
|
| API utilizada:
|
|     GET    /api/profile
|     PUT    /api/profile
|     DELETE /api/profile
|
| Fotografía:
|
|     La fotografía pertenece al documento User y NO al documento
|     Profile.
|
|     Se obtiene desde:
|
|         AuthService.getCurrentUser()
|
|     La propiedad utilizada es:
|
|         profile_photo
|
|     Laravel puede almacenar una ruta relativa como:
|
|         profile-photos/archivo.jpg
|
|     El frontend la convierte en:
|
|         http://127.0.0.1:8000/storage/profile-photos/archivo.jpg
|
| Importante:
|
|     La fotografía NO se envía mediante PUT /api/profile.
|
|     Esto evita mezclar los datos del usuario con los datos
|     adicionales almacenados en el documento Profile.
|
|--------------------------------------------------------------------------
*/

import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Profile,
  ProfileResponse,
  ProfileService
} from '../../services/profile.service';

import {
  AuthService
} from '../../services/auth.service';

import {
  AuthUser
} from '../../models/auth';


/*
|--------------------------------------------------------------------------
| COMPONENTE
|--------------------------------------------------------------------------
*/

@Component({

  selector: 'app-profile',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './profile.component.html',

  styleUrl:
    './profile.component.css'

})


export class ProfileComponent
  implements OnInit {


  /*
  |--------------------------------------------------------------------------
  | PERFIL
  |--------------------------------------------------------------------------
  |
  | Modelo utilizado por el formulario.
  |
  | Se inicializa con valores vacíos para evitar propiedades
  | undefined durante la carga inicial.
  |
  |--------------------------------------------------------------------------
  */

  profile: Profile = {

    phone: '',

    address: '',

    city: '',

    state: '',

    country: '',

    postal_code: '',

    birth_date: '',

    gender: '',

    bio: ''

  };


  /*
  |--------------------------------------------------------------------------
  | USUARIO AUTENTICADO
  |--------------------------------------------------------------------------
  |
  | AuthService mantiene el usuario obtenido mediante:
  |
  |     GET /api/me
  |
  | AuthUser contiene:
  |
  |     id
  |     code
  |     name
  |     email
  |     phone
  |     profile_photo
  |
  | La contraseña nunca forma parte de este objeto.
  |
  |--------------------------------------------------------------------------
  */

  currentUser:
    AuthUser | null = null;


  /*
  |--------------------------------------------------------------------------
  | URL PÚBLICA DE LA FOTOGRAFÍA
  |--------------------------------------------------------------------------
  |
  | Esta propiedad contiene la URL que utilizará el navegador.
  |
  | Ejemplo:
  |
  |     http://127.0.0.1:8000/storage/profile-photos/foto.jpg
  |
  | Si el usuario no tiene fotografía:
  |
  |     null
  |
  |--------------------------------------------------------------------------
  */

  profilePhotoUrl:
    string | null = null;


  /*
  |--------------------------------------------------------------------------
  | ESTADOS DE OPERACIÓN
  |--------------------------------------------------------------------------
  */

  loading = false;

  saving = false;

  deleting = false;


  /*
  |--------------------------------------------------------------------------
  | MENSAJES
  |--------------------------------------------------------------------------
  */

  message = '';

  messageType:
    'success' |
    'error' |
    'info' = 'info';


  /*
  |--------------------------------------------------------------------------
  | CONSTRUCTOR
  |--------------------------------------------------------------------------
  */

  constructor(

    private readonly profileService:
      ProfileService,

    private readonly authService:
      AuthService

  ) {}


  /*
  |--------------------------------------------------------------------------
  | INICIALIZACIÓN
  |--------------------------------------------------------------------------
  */

  ngOnInit(): void {

    /*
    |--------------------------------------------------------------------------
    | CARGAR USUARIO AUTENTICADO
    |--------------------------------------------------------------------------
    |
    | La fotografía se encuentra asociada al usuario y no al perfil.
    |
    |--------------------------------------------------------------------------
    */

    this.loadCurrentUser();


    /*
    |--------------------------------------------------------------------------
    | CARGAR INFORMACIÓN DEL PERFIL
    |--------------------------------------------------------------------------
    */

    this.loadProfile();

  }


  /*
  |--------------------------------------------------------------------------
  | CARGAR USUARIO ACTUAL
  |--------------------------------------------------------------------------
  |
  | Obtiene el usuario desde AuthService.
  |
  | El método getCurrentUser() devuelve el valor actualmente
  | almacenado por AuthService.
  |
  |--------------------------------------------------------------------------
  */

  private loadCurrentUser(): void {

    this.currentUser =
      this.authService.getCurrentUser();


    /*
    |--------------------------------------------------------------------------
    | CONSTRUIR URL DE FOTOGRAFÍA
    |--------------------------------------------------------------------------
    */

    this.profilePhotoUrl =
      this.buildProfilePhotoUrl(
        this.currentUser?.profile_photo
      );

  }


  /*
  |--------------------------------------------------------------------------
  | CONSTRUIR URL DE FOTOGRAFÍA
  |--------------------------------------------------------------------------
  |
  | Laravel guarda normalmente:
  |
  |     profile-photos/foto.jpg
  |
  | La ruta pública de Laravel es:
  |
  |     /storage/profile-photos/foto.jpg
  |
  | Por tanto construimos:
  |
  |     http://127.0.0.1:8000/storage/profile-photos/foto.jpg
  |
  | También soportamos:
  |
  |     - URL completa http://...
  |     - URL completa https://...
  |     - rutas que ya comienzan con storage/
  |     - rutas relativas normales
  |
  |--------------------------------------------------------------------------
  */

  private buildProfilePhotoUrl(
    photoPath:
      string |
      null |
      undefined
  ): string | null {

    /*
    |--------------------------------------------------------------------------
    | SIN FOTOGRAFÍA
    |--------------------------------------------------------------------------
    */

    if (
      !photoPath
    ) {

      return null;

    }


    const cleanPath =
      String(
        photoPath
      ).trim();


    if (
      !cleanPath
    ) {

      return null;

    }


    /*
    |--------------------------------------------------------------------------
    | URL COMPLETA
    |--------------------------------------------------------------------------
    |
    | Si Laravel ya entrega una URL absoluta no agregamos
    | nuevamente el dominio.
    |
    |--------------------------------------------------------------------------
    */

    if (
      cleanPath.startsWith(
        'http://'
      ) ||
      cleanPath.startsWith(
        'https://'
      )
    ) {

      return cleanPath;

    }


    /*
    |--------------------------------------------------------------------------
    | NORMALIZAR SLASH INICIAL
    |--------------------------------------------------------------------------
    */

    const normalizedPath =
      cleanPath.replace(
        /^\/+/,
        ''
      );


    /*
    |--------------------------------------------------------------------------
    | RUTA QUE YA INCLUYE STORAGE
    |--------------------------------------------------------------------------
    */

    if (
      normalizedPath.startsWith(
        'storage/'
      )
    ) {

      return (
        'http://127.0.0.1:8000/' +
        normalizedPath
      );

    }


    /*
    |--------------------------------------------------------------------------
    | RUTA NORMAL
    |--------------------------------------------------------------------------
    */

    return (
      'http://127.0.0.1:8000/storage/' +
      normalizedPath
    );

  }


  /*
  |--------------------------------------------------------------------------
  | CARGAR PERFIL
  |--------------------------------------------------------------------------
  |
  | GET /api/profile
  |
  | Obtiene los datos adicionales del perfil del usuario autenticado.
  |
  |--------------------------------------------------------------------------
  */

  loadProfile(): void {

    /*
    |--------------------------------------------------------------------------
    | EVITAR PETICIONES DUPLICADAS
    |--------------------------------------------------------------------------
    */

    if (
      this.loading
    ) {

      return;

    }


    this.loading = true;

    this.clearMessage();


    this.profileService
      .getProfile()
      .subscribe({

        /*
        |--------------------------------------------------------------------------
        | RESPUESTA CORRECTA
        |--------------------------------------------------------------------------
        */

        next:
          (response: ProfileResponse) => {

            /*
            |--------------------------------------------------------------------------
            | PERFIL EXISTENTE
            |--------------------------------------------------------------------------
            |
            | Si Laravel devuelve data = null, simplemente mantenemos
            | los valores vacíos iniciales.
            |
            |--------------------------------------------------------------------------
            */

            if (
              response.data
            ) {

              this.profile = {

                ...this.profile,

                ...response.data

              };

            }

          },


        /*
        |--------------------------------------------------------------------------
        | ERROR
        |--------------------------------------------------------------------------
        */

        error:
          (error: unknown) => {

            console.error(
              'Error al cargar el perfil:',
              error
            );

            this.handleApiError(
              error,
              'No fue posible cargar el perfil.'
            );

          },


        /*
        |--------------------------------------------------------------------------
        | FINALIZAR CARGA
        |--------------------------------------------------------------------------
        */

        complete: () => {

          this.loading = false;

        }

      });

  }


  /*
  |--------------------------------------------------------------------------
  | GUARDAR PERFIL
  |--------------------------------------------------------------------------
  |
  | PUT /api/profile
  |
  | Solamente se envían los campos pertenecientes al documento Profile.
  |
  | La fotografía del usuario no forma parte de esta petición.
  |
  |--------------------------------------------------------------------------
  */

  saveProfile(): void {

    /*
    |--------------------------------------------------------------------------
    | EVITAR OPERACIONES SIMULTÁNEAS
    |--------------------------------------------------------------------------
    */

    if (
      this.saving ||
      this.deleting
    ) {

      return;

    }


    this.clearMessage();


    /*
    |--------------------------------------------------------------------------
    | CONSTRUIR DATOS LIMPIOS
    |--------------------------------------------------------------------------
    */

    const data: Profile = {

      phone:
        this.cleanValue(
          this.profile.phone
        ),

      address:
        this.cleanValue(
          this.profile.address
        ),

      city:
        this.cleanValue(
          this.profile.city
        ),

      state:
        this.cleanValue(
          this.profile.state
        ),

      country:
        this.cleanValue(
          this.profile.country
        ),

      postal_code:
        this.cleanValue(
          this.profile.postal_code
        ),

      birth_date:
        this.cleanValue(
          this.profile.birth_date
        ),

      gender:
        this.cleanValue(
          this.profile.gender
        ),

      bio:
        this.cleanValue(
          this.profile.bio
        )

    };


    this.saving = true;


    /*
    |--------------------------------------------------------------------------
    | ENVIAR AL BACKEND
    |--------------------------------------------------------------------------
    */

    this.profileService
      .updateProfile(data)
      .subscribe({

        /*
        |--------------------------------------------------------------------------
        | RESPUESTA CORRECTA
        |--------------------------------------------------------------------------
        */

        next:
          (response: ProfileResponse) => {

            /*
            |--------------------------------------------------------------------------
            | ACTUALIZAR MODELO
            |--------------------------------------------------------------------------
            */

            if (
              response.data
            ) {

              this.profile = {

                ...this.profile,

                ...response.data

              };

            }


            /*
            |--------------------------------------------------------------------------
            | ACTUALIZAR INFORMACIÓN DEL USUARIO
            |--------------------------------------------------------------------------
            |
            | Esto vuelve a leer el estado actual de AuthService.
            |
            | No modifica la fotografía porque PUT /api/profile
            | no administra la fotografía.
            |
            |--------------------------------------------------------------------------
            */

            this.loadCurrentUser();


            /*
            |--------------------------------------------------------------------------
            | MENSAJE
            |--------------------------------------------------------------------------
            */

            this.showMessage(

              'success',

              response.message ||
              'Perfil actualizado correctamente.'

            );

          },


        /*
        |--------------------------------------------------------------------------
        | ERROR
        |--------------------------------------------------------------------------
        */

        error:
          (error: unknown) => {

            console.error(
              'Error al actualizar el perfil:',
              error
            );

            this.handleApiError(
              error,
              'No fue posible actualizar el perfil.'
            );

          },


        /*
        |--------------------------------------------------------------------------
        | FINALIZAR OPERACIÓN
        |--------------------------------------------------------------------------
        */

        complete: () => {

          this.saving = false;

        }

      });

  }


  /*
  |--------------------------------------------------------------------------
  | ELIMINAR PERFIL
  |--------------------------------------------------------------------------
  |
  | DELETE /api/profile
  |
  | Elimina únicamente los datos adicionales del perfil.
  |
  | El usuario y su fotografía permanecen intactos.
  |
  |--------------------------------------------------------------------------
  */

  deleteProfile(): void {

    /*
    |--------------------------------------------------------------------------
    | EVITAR OPERACIONES SIMULTÁNEAS
    |--------------------------------------------------------------------------
    */

    if (
      this.deleting ||
      this.saving
    ) {

      return;

    }


    /*
    |--------------------------------------------------------------------------
    | CONFIRMACIÓN
    |--------------------------------------------------------------------------
    */

    const confirmed =
      window.confirm(
        '¿Deseas eliminar tu perfil? Esta acción no se puede deshacer.'
      );


    if (
      !confirmed
    ) {

      return;

    }


    this.clearMessage();

    this.deleting = true;


    /*
    |--------------------------------------------------------------------------
    | PETICIÓN DELETE
    |--------------------------------------------------------------------------
    */

    this.profileService
      .deleteProfile()
      .subscribe({

        /*
        |--------------------------------------------------------------------------
        | RESPUESTA CORRECTA
        |--------------------------------------------------------------------------
        */

        next:
          (response) => {

            /*
            |--------------------------------------------------------------------------
            | LIMPIAR DATOS DEL PERFIL
            |--------------------------------------------------------------------------
            */

            this.resetProfile();


            /*
            |--------------------------------------------------------------------------
            | MENSAJE
            |--------------------------------------------------------------------------
            */

            this.showMessage(

              'success',

              response.message ||
              'Perfil eliminado correctamente.'

            );

          },


        /*
        |--------------------------------------------------------------------------
        | ERROR
        |--------------------------------------------------------------------------
        */

        error:
          (error: unknown) => {

            console.error(
              'Error al eliminar el perfil:',
              error
            );

            this.handleApiError(
              error,
              'No fue posible eliminar el perfil.'
            );

          },


        /*
        |--------------------------------------------------------------------------
        | FINALIZAR OPERACIÓN
        |--------------------------------------------------------------------------
        */

        complete: () => {

          this.deleting = false;

        }

      });

  }


  /*
  |--------------------------------------------------------------------------
  | RESTABLECER PERFIL
  |--------------------------------------------------------------------------
  |
  | Limpia únicamente los campos pertenecientes al perfil.
  |
  | La fotografía del usuario NO se elimina.
  |
  |--------------------------------------------------------------------------
  */

  private resetProfile(): void {

    this.profile = {

      phone: '',

      address: '',

      city: '',

      state: '',

      country: '',

      postal_code: '',

      birth_date: '',

      gender: '',

      bio: ''

    };

  }


  /*
  |--------------------------------------------------------------------------
  | LIMPIAR VALOR
  |--------------------------------------------------------------------------
  |
  | Convierte null y undefined en cadena vacía y elimina espacios
  | innecesarios.
  |
  |--------------------------------------------------------------------------
  */

  private cleanValue(
    value:
      string |
      null |
      undefined
  ): string {

    return String(
      value ?? ''
    ).trim();

  }


  /*
  |--------------------------------------------------------------------------
  | MANEJO DE ERRORES DEL API
  |--------------------------------------------------------------------------
  */

  private handleApiError(
    error: unknown,
    fallbackMessage: string
  ): void {

    const httpError =
      error as {

        status?: number;

        message?: string;

        error?: {

          message?: string;

          errors?: Record<
            string,
            string[]
          >;

        };

      };


    /*
    |--------------------------------------------------------------------------
    | ERRORES DE VALIDACIÓN 422
    |--------------------------------------------------------------------------
    */

    if (
      httpError.status === 422 &&
      httpError.error?.errors
    ) {

      const errors =
        httpError.error.errors;


      const firstField =
        Object.keys(
          errors
        )[0];


      const firstMessage =
        firstField
          ? errors[firstField]?.[0]
          : null;


      if (
        firstMessage
      ) {

        this.showMessage(
          'error',
          firstMessage
        );

        return;

      }

    }


    /*
    |--------------------------------------------------------------------------
    | MENSAJE DEL BACKEND
    |--------------------------------------------------------------------------
    */

    if (
      httpError.error?.message
    ) {

      this.showMessage(
        'error',
        httpError.error.message
      );

      return;

    }


    /*
    |--------------------------------------------------------------------------
    | ERRORES HTTP CONOCIDOS
    |--------------------------------------------------------------------------
    */

    switch (
      httpError.status
    ) {

      /*
      |--------------------------------------------------------------------------
      | SIN CONEXIÓN
      |--------------------------------------------------------------------------
      */

      case 0:

        this.showMessage(
          'error',
          'No fue posible conectarse con Laravel. Verifica que el backend esté ejecutándose.'
        );

        return;


      /*
      |--------------------------------------------------------------------------
      | NO AUTENTICADO
      |--------------------------------------------------------------------------
      */

      case 401:

        this.showMessage(
          'error',
          'La sesión no es válida o ha expirado.'
        );

        return;


      /*
      |--------------------------------------------------------------------------
      | SIN PERMISOS
      |--------------------------------------------------------------------------
      */

      case 403:

        this.showMessage(
          'error',
          'No tienes permisos para realizar esta operación.'
        );

        return;


      /*
      |--------------------------------------------------------------------------
      | NO ENCONTRADO
      |--------------------------------------------------------------------------
      */

      case 404:

        this.showMessage(
          'error',
          'El perfil solicitado no existe.'
        );

        return;


      /*
      |--------------------------------------------------------------------------
      | ERROR DEL SERVIDOR
      |--------------------------------------------------------------------------
      */

      case 500:

        this.showMessage(
          'error',
          'Ocurrió un error interno en el servidor.'
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | MENSAJE GENERAL
    |--------------------------------------------------------------------------
    */

    this.showMessage(
      'error',
      fallbackMessage
    );

  }


  /*
  |--------------------------------------------------------------------------
  | MOSTRAR MENSAJE
  |--------------------------------------------------------------------------
  */

  showMessage(

    type:
      'success' |
      'error' |
      'info',

    message:
      string

  ): void {

    this.messageType =
      type;

    this.message =
      message;

  }


  /*
  |--------------------------------------------------------------------------
  | LIMPIAR MENSAJE
  |--------------------------------------------------------------------------
  */

  clearMessage(): void {

    this.message =
      '';

  }

}