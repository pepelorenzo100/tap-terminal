/**
 * ============================================================
 * TAP TERMINAL
 * USERS COMPONENT
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/pages/users/users.component.ts
 *
 * Responsabilidad:
 *
 * Administrar la pantalla de usuarios del sistema TAP Terminal.
 *
 * Funcionalidades:
 *
 * - Listar usuarios.
 * - Crear usuarios.
 * - Editar usuarios.
 * - Eliminar usuarios.
 * - Consultar detalle de usuario.
 * - Seleccionar fotografía de perfil.
 * - Validar fotografía.
 * - Validar correo electrónico.
 * - Validar teléfono.
 * - Validar contraseña.
 * - Cargar perfiles de autorización.
 * - Asignar perfiles de autorización.
 * - Cambiar perfiles de autorización.
 * - Mostrar perfiles asignados.
 * - Construir URL pública de fotografías.
 * - Exportar usuarios a Excel.
 * - Exportar usuarios a PDF.
 *
 * API utilizada:
 *
 *     GET    /api/users
 *     POST   /api/users
 *     GET    /api/users/{id}
 *     PUT    /api/users/{id}
 *     DELETE /api/users/{id}
 *
 * Perfiles:
 *
 *     GET /api/access-profiles
 *
 * Seguridad:
 *
 * La autenticación se gestiona mediante:
 *
 *     AuthService
 *     AuthInterceptor
 *     Laravel Sanctum
 *
 * El cierre de sesión NO pertenece a este componente.
 *
 * El logout está centralizado en:
 *
 *     shared/navbar/navbar.component.ts
 *
 * ============================================================
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
  User,
  UserResponse,
  UserService
} from '../../services/user.service';

import {
  AccessProfile
} from '../../models/auth';

import {
  AccessProfileService
} from '../../services/access-profile.service';

import * as XLSX from 'xlsx';

import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';


/**
 * ============================================================
 * COMPONENTE
 * ============================================================
 */

@Component({

  selector:
    'app-users',

  standalone:
    true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './users.component.html',

  styleUrl:
    './users.component.css'

})


/**
 * ============================================================
 * CLASE USERS COMPONENT
 * ============================================================
 */

export class UsersComponent
  implements OnInit {


  /**
   * ==========================================================
   * URL BASE DEL BACKEND
   * ==========================================================
   *
   * Laravel:
   *
   *     http://127.0.0.1:8000
   *
   * Laravel publica:
   *
   *     storage/app/public
   *
   * mediante:
   *
   *     /storage
   *
   * ==========================================================
   */

  private readonly backendUrl =
    'http://127.0.0.1:8000';


  /**
   * ==========================================================
   * LISTA DE USUARIOS
   * ==========================================================
   */

  users: User[] = [];


  /**
   * ==========================================================
   * PERFILES DE AUTORIZACIÓN
   * ==========================================================
   *
   * Se obtienen mediante:
   *
   *     GET /api/access-profiles
   *
   * Los perfiles son administrados por:
   *
   *     AccessProfileService
   *
   * ==========================================================
   */

  accessProfiles:
    AccessProfile[] = [];


  /**
   * ==========================================================
   * ESTADO DE CARGA DE PERFILES
   * ==========================================================
   */

  loadingProfiles =
    false;


  /**
   * ==========================================================
   * PERFILES SELECCIONADOS
   * ==========================================================
   *
   * Contiene los IDs MongoDB de los perfiles asignados
   * al usuario que se está creando o editando.
   *
   * Laravel espera:
   *
   *     profile_ids[]
   *
   * ==========================================================
   */

  selectedProfileIds:
    string[] = [];


  /**
   * ==========================================================
   * ESTADO DEL FORMULARIO
   * ==========================================================
   *
   * showForm:
   *
   *     false = formulario oculto.
   *     true  = formulario visible.
   *
   * editingUserId:
   *
   *     null  = creación.
   *     valor = edición.
   * ==========================================================
   */

  showForm =
    false;


  editingUserId:
    string | null =
    null;


  /**
   * ==========================================================
   * DATOS DEL FORMULARIO
   * ==========================================================
   *
   * La contraseña nunca se obtiene desde Laravel.
   *
   * Solamente se utiliza cuando:
   *
   * - se crea un usuario;
   * - se cambia explícitamente durante la edición.
   * ==========================================================
   */

  form = {

    name:
      '',

    email:
      '',

    phone:
      '',

    password:
      ''

  };


  /**
   * ==========================================================
   * FOTOGRAFÍA DE PERFIL
   * ==========================================================
   *
   * Formatos:
   *
   *     JPG
   *     PNG
   *     WEBP
   *
   * Tamaño máximo:
   *
   *     2 MB
   * ==========================================================
   */

  selectedFile:
    File | null =
    null;


  selectedFileName =
    '';


  /**
   * ==========================================================
   * USUARIO SELECCIONADO
   * ==========================================================
   */

  selectedUser:
    User | null =
    null;


  showDetailModal =
    false;


  /**
   * ==========================================================
   * MENSAJES
   * ==========================================================
   */

  message =
    '';


  messageType:
    'success' |
    'error' |
    'info' =
    'info';


  /**
   * ==========================================================
   * ESTADO DE GUARDADO
   * ==========================================================
   */

  saving =
    false;


  /**
   * ==========================================================
   * CONSTRUCTOR
   * ==========================================================
   */

  constructor(

    private readonly userService:
      UserService,

    private readonly accessProfileService:
      AccessProfileService

  ) {}


  /**
   * ==========================================================
   * INICIALIZACIÓN
   * ==========================================================
   *
   * Carga:
   *
   * - usuarios;
   * - perfiles de autorización.
   * ==========================================================
   */

  ngOnInit(): void {

    this.loadUsers();

    this.loadAccessProfiles();

  }


  /**
   * ==========================================================
   * CARGAR USUARIOS
   * ==========================================================
   *
   * GET /api/users
   * ==========================================================
   */

  loadUsers(): void {

    this.userService
      .getUsers()
      .subscribe({

        next:
          (response: UserResponse) => {

            if (
              Array.isArray(
                response.data
              )
            ) {

              this.users =
                response.data;

              return;

            }


            this.users =
              [];

          },


        error:
          (error: unknown) => {

            console.error(
              'Error al cargar usuarios:',
              error
            );


            this.users =
              [];


            this.showMessage(
              'error',
              'No fue posible cargar los usuarios.'
            );

          }

      });

  }


  /**
   * ==========================================================
   * CARGAR PERFILES DE AUTORIZACIÓN
   * ==========================================================
   *
   * GET /api/access-profiles
   *
   * Utiliza:
   *
   *     AccessProfileService
   * ==========================================================
   */

  loadAccessProfiles(): void {

    this.loadingProfiles =
      true;


    this.accessProfileService
      .getAll()
      .subscribe({

        /**
         * ----------------------------------------------------
         * RESPUESTA CORRECTA
         * ----------------------------------------------------
         */

        next:
          (response) => {

            this.accessProfiles =
              response.data ?? [];

          },


        /**
         * ----------------------------------------------------
         * ERROR
         * ----------------------------------------------------
         */

        error:
          (error: Error) => {

            console.error(
              'Error al cargar perfiles de autorización:',
              error
            );


            this.accessProfiles =
              [];


            this.showMessage(
              'error',
              error.message ||
              'No fue posible cargar los perfiles de autorización.'
            );


            this.loadingProfiles =
              false;

          },


        /**
         * ----------------------------------------------------
         * FINALIZACIÓN
         * ----------------------------------------------------
         */

        complete:
          () => {

            this.loadingProfiles =
              false;

          }

      });

  }


  /**
   * ==========================================================
   * COMPROBAR PERFIL SELECCIONADO
   * ==========================================================
   */

  isProfileSelected(
    profileId: string
  ): boolean {

    return this.selectedProfileIds
      .includes(
        String(profileId)
      );

  }


  /**
   * ==========================================================
   * CAMBIAR PERFIL SELECCIONADO
   * ==========================================================
   *
   * Agrega o elimina un perfil de la selección actual.
   * ==========================================================
   */

  toggleProfile(
    profileId: string
  ): void {

    const id =
      String(profileId);


    const index =
      this.selectedProfileIds
        .indexOf(id);


    if (index >= 0) {

      this.selectedProfileIds
        .splice(
          index,
          1
        );

      return;

    }


    this.selectedProfileIds
      .push(id);

  }


  /**
   * ==========================================================
   * REINICIAR PERFILES SELECCIONADOS
   * ==========================================================
   *
   * Limpia completamente la selección de perfiles.
   *
   * Se utiliza cuando:
   *
   * - se abre un nuevo formulario;
   * - se cancela una operación;
   * - se completa una creación;
   * - se completa una edición.
   *
   * ==========================================================
   */

  private resetSelectedProfiles(): void {

    this.selectedProfileIds =
      [];

  }


  /**
   * ==========================================================
   * OBTENER NOMBRES DE PERFILES
   * ==========================================================
   *
   * Utilizado para mostrar los perfiles del usuario
   * en el detalle y las exportaciones.
   * ==========================================================
   */

  getUserProfileNames(
    user: User
  ): string {

    if (
      !user.profiles ||
      user.profiles.length === 0
    ) {

      return 'Sin perfiles';

    }


    return user.profiles
      .map(
        profile =>
          profile.name
      )
      .filter(Boolean)
      .join(', ');

  }


  /**
   * ==========================================================
   * OBTENER CÓDIGOS DE PERFILES
   * ==========================================================
   *
   * Útil para exportaciones y visualización.
   * ==========================================================
   */

  getUserProfileCodes(
    user: User
  ): string {

    if (
      !user.profiles ||
      user.profiles.length === 0
    ) {

      return 'Sin perfiles';

    }


    return user.profiles
      .map(
        profile =>
          profile.code
      )
      .filter(Boolean)
      .join(', ');

  }


  /**
   * ==========================================================
   * CONSTRUIR URL DE FOTOGRAFÍA
   * ==========================================================
   */

  getProfilePhotoUrl(

    photoPath:
      string |
      null |
      undefined

  ): string {

    if (!photoPath) {

      return '';

    }


    const photo =
      photoPath.trim();


    if (!photo) {

      return '';

    }


    /**
     * --------------------------------------------------------
     * URL ABSOLUTA
     * --------------------------------------------------------
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


    /**
     * --------------------------------------------------------
     * NORMALIZAR SLASH
     * --------------------------------------------------------
     */

    const normalizedPath =
      photo.replace(
        /^\/+/,
        ''
      );


    /**
     * --------------------------------------------------------
     * STORAGE YA INCLUIDO
     * --------------------------------------------------------
     */

    if (
      normalizedPath.startsWith(
        'storage/'
      )
    ) {

      return `${this.backendUrl}/${normalizedPath}`;

    }


    /**
     * --------------------------------------------------------
     * STORAGE NORMAL
     * --------------------------------------------------------
     */

    return `${this.backendUrl}/storage/${normalizedPath}`;

  }


  /**
   * ==========================================================
   * ABRIR FORMULARIO DE CREACIÓN
   * ==========================================================
   */

  showCreateForm(): void {

    this.closeDetailModal();

    this.clearMessage();

    this.resetFormValues();


    this.editingUserId =
      null;


    this.showForm =
      true;

  }


  /**
   * ==========================================================
   * SELECCIONAR FOTOGRAFÍA
   * ==========================================================
   */

  onFileSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (

      !input.files ||

      input.files.length === 0

    ) {

      this.selectedFile =
        null;

      this.selectedFileName =
        '';

      return;

    }


    const file =
      input.files[0];


    /**
     * --------------------------------------------------------
     * FORMATOS PERMITIDOS
     * --------------------------------------------------------
     */

    const allowedTypes = [

      'image/jpeg',

      'image/png',

      'image/webp'

    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      this.showMessage(
        'error',
        'La fotografía debe ser JPG, PNG o WEBP.'
      );


      input.value =
        '';


      this.selectedFile =
        null;


      this.selectedFileName =
        '';

      return;

    }


    /**
     * --------------------------------------------------------
     * TAMAÑO MÁXIMO
     * --------------------------------------------------------
     *
     * 2 MB.
     * --------------------------------------------------------
     */

    const maxSize =
      2 * 1024 * 1024;


    if (
      file.size > maxSize
    ) {

      this.showMessage(
        'error',
        'La fotografía no puede superar 2 MB.'
      );


      input.value =
        '';


      this.selectedFile =
        null;


      this.selectedFileName =
        '';

      return;

    }


    /**
     * --------------------------------------------------------
     * ARCHIVO VÁLIDO
     * --------------------------------------------------------
     */

    this.selectedFile =
      file;


    this.selectedFileName =
      file.name;

  }


  /**
   * ==========================================================
   * GUARDAR USUARIO
   * ==========================================================
   *
   * CREACIÓN:
   *
   *     POST /api/users
   *
   * ACTUALIZACIÓN:
   *
   *     POST /api/users/{id}
   *
   * El UserService agrega:
   *
   *     _method=PUT
   *
   * ==========================================================
   */

  saveUser(): void {

    /**
     * --------------------------------------------------------
     * EVITAR ENVÍOS SIMULTÁNEOS
     * --------------------------------------------------------
     */

    if (this.saving) {

      return;

    }


    this.clearMessage();


    /**
     * --------------------------------------------------------
     * VALIDAR NOMBRE
     * --------------------------------------------------------
     */

    const name =
      this.cleanValue(
        this.form.name
      );


    if (!name) {

      this.showMessage(
        'error',
        'El nombre es obligatorio.'
      );

      return;

    }


    /**
     * --------------------------------------------------------
     * VALIDAR CORREO
     * --------------------------------------------------------
     */

    const email =
      this.cleanValue(
        this.form.email
      );


    if (!email) {

      this.showMessage(
        'error',
        'El correo electrónico es obligatorio.'
      );

      return;

    }


    if (
      !this.isValidEmail(
        email
      )
    ) {

      this.showMessage(
        'error',
        'Introduce un correo electrónico válido.'
      );

      return;

    }


    /**
     * --------------------------------------------------------
     * VALIDAR TELÉFONO
     * --------------------------------------------------------
     */

    const phone =
      this.cleanValue(
        this.form.phone
      );


    if (

      phone &&

      !this.isValidPhone(
        phone
      )

    ) {

      this.showMessage(
        'error',
        'El teléfono debe incluir código de país, por ejemplo +523141234567.'
      );

      return;

    }


    /**
     * --------------------------------------------------------
     * VALIDAR CONTRASEÑA
     * --------------------------------------------------------
     *
     * Creación:
     *
     *     obligatoria.
     *
     * Edición:
     *
     *     opcional.
     * --------------------------------------------------------
     */

    const password =
      this.form.password ??
      '';


    if (

      this.editingUserId === null &&

      !password

    ) {

      this.showMessage(
        'error',
        'La contraseña es obligatoria para crear un usuario.'
      );

      return;

    }


    if (

      password &&

      password.length < 8

    ) {

      this.showMessage(
        'error',
        'La contraseña debe tener al menos 8 caracteres.'
      );

      return;

    }


    /**
     * --------------------------------------------------------
     * VALIDAR FOTOGRAFÍA
     * --------------------------------------------------------
     *
     * Creación:
     *
     *     obligatoria.
     *
     * Edición:
     *
     *     opcional.
     * --------------------------------------------------------
     */

    if (

      this.editingUserId === null &&

      !this.selectedFile

    ) {

      this.showMessage(
        'error',
        'La fotografía de perfil es obligatoria.'
      );

      return;

    }


    /**
     * --------------------------------------------------------
     * VALIDAR PERFILES
     * --------------------------------------------------------
     *
     * Laravel exige:
     *
     *     profile_ids[]
     *
     *     required
     *     array
     *     min:1
     * --------------------------------------------------------
     */

    if (
      this.selectedProfileIds.length === 0
    ) {

      this.showMessage(
        'error',
        'Debes asignar al menos un perfil de autorización.'
      );

      return;

    }


    /**
     * ========================================================
     * CONSTRUIR FORMDATA
     * ========================================================
     */

    const formData =
      new FormData();


    /**
     * --------------------------------------------------------
     * DATOS BÁSICOS
     * --------------------------------------------------------
     */

    formData.append(
      'name',
      name
    );


    formData.append(
      'email',
      email
    );


    /**
     * --------------------------------------------------------
     * TELÉFONO
     * --------------------------------------------------------
     */

    if (phone) {

      formData.append(
        'phone',
        phone
      );

    }


    /**
     * --------------------------------------------------------
     * CONTRASEÑA
     * --------------------------------------------------------
     */

    if (password) {

      formData.append(
        'password',
        password
      );

    }


    /**
     * --------------------------------------------------------
     * FOTOGRAFÍA
     * --------------------------------------------------------
     */

    if (this.selectedFile) {

      formData.append(
        'profile_photo',
        this.selectedFile
      );

    }


    /**
     * --------------------------------------------------------
     * PERFILES DE AUTORIZACIÓN
     * --------------------------------------------------------
     *
     * Laravel recibe:
     *
     *     profile_ids[]
     *
     *     profile_ids[]
     *
     *     profile_ids[]
     *
     * ========================================================
     */

    this.selectedProfileIds
      .forEach(
        (profileId: string) => {

          formData.append(
            'profile_ids[]',
            profileId
          );

        }
      );


    this.saving =
      true;


    /**
     * ========================================================
     * CREAR USUARIO
     * ========================================================
     */

    if (
      this.editingUserId === null
    ) {

      this.userService
        .createUser(
          formData
        )
        .subscribe({

          /**
           * --------------------------------------------------
           * CREACIÓN CORRECTA
           * --------------------------------------------------
           */

          next:
            (
              response: UserResponse
            ) => {

              if (
                !Array.isArray(
                  response.data
                )
              ) {

                this.users = [

                  ...this.users,

                  response.data

                ];

              }


              this.showMessage(
                'success',
                response.message ||
                'Usuario creado correctamente.'
              );


              this.resetForm();

            },


          /**
           * --------------------------------------------------
           * ERROR
           * --------------------------------------------------
           */

          error:
            (error: unknown) => {

              console.error(
                'Error al crear usuario:',
                error
              );


              this.handleApiError(
                error,
                'No fue posible crear el usuario.'
              );


              this.saving =
                false;

            },


          /**
           * --------------------------------------------------
           * FINALIZACIÓN
           * --------------------------------------------------
           */

          complete:
            () => {

              this.saving =
                false;

            }

        });


      return;

    }


    /**
     * ========================================================
     * ACTUALIZAR USUARIO
     * ========================================================
     */

    const userId =
      this.editingUserId;


    this.userService
      .updateUser(
        userId,
        formData
      )
      .subscribe({

        /**
         * ----------------------------------------------------
         * ACTUALIZACIÓN CORRECTA
         * ----------------------------------------------------
         */

        next:
          (
            response: UserResponse
          ) => {

            if (
              !Array.isArray(
                response.data
              )
            ) {

              this.users =
                this.users.map(

                  (
                    user: User
                  ): User => {

                    const currentId =
                      String(
                        user.id ?? ''
                      );


                    if (
                      currentId ===
                      userId
                    ) {

                      return response.data as User;

                    }


                    return user;

                  }

                );

            }


            /**
             * ------------------------------------------------
             * ACTUALIZAR DETALLE
             * ------------------------------------------------
             */

            if (

              this.selectedUser &&

              String(
                this.selectedUser.id ?? ''
              ) === userId &&

              !Array.isArray(
                response.data
              )

            ) {

              this.selectedUser =
                response.data as User;

            }


            this.showMessage(
              'success',
              response.message ||
              'Usuario actualizado correctamente.'
            );


            this.resetForm();

          },


        /**
         * ----------------------------------------------------
         * ERROR
         * ----------------------------------------------------
         */

        error:
          (error: unknown) => {

            console.error(
              'Error al actualizar usuario:',
              error
            );


            this.handleApiError(
              error,
              'No fue posible actualizar el usuario.'
            );


            this.saving =
              false;

          },


        /**
         * ----------------------------------------------------
         * FINALIZACIÓN
         * ----------------------------------------------------
         */

        complete:
          () => {

            this.saving =
              false;

          }

      });

  }


  /**
   * ==========================================================
   * EDITAR USUARIO
   * ==========================================================
   *
   * Al editar:
   *
   * - carga datos básicos;
   * - limpia contraseña;
   * - limpia fotografía seleccionada;
   * - carga los IDs de los perfiles existentes.
   * ==========================================================
   */

  editUser(
    user: User
  ): void {

    this.closeDetailModal();

    this.clearMessage();


    if (!user.id) {

      this.showMessage(
        'error',
        'El usuario no tiene un identificador válido.'
      );

      return;

    }


    this.editingUserId =
      String(
        user.id
      );


    this.form = {

      name:
        user.name ?? '',

      email:
        user.email ?? '',

      phone:
        user.phone ?? '',

      password:
        ''

    };


    /**
     * --------------------------------------------------------
     * CARGAR PERFILES EXISTENTES
     * --------------------------------------------------------
     */

    this.selectedProfileIds =
      (user.profiles ?? [])
        .map(
          profile =>
            String(
              profile.id
            )
        )
        .filter(
          profileId =>
            Boolean(profileId)
        );


    /**
     * --------------------------------------------------------
     * LIMPIAR FOTO SELECCIONADA
     * --------------------------------------------------------
     */

    this.selectedFile =
      null;


    this.selectedFileName =
      '';


    this.showForm =
      true;

  }


  /**
   * ==========================================================
   * VER DETALLE
   * ==========================================================
   */

  viewUser(
    user: User
  ): void {

    this.clearMessage();


    this.selectedUser =
      user;


    this.showDetailModal =
      true;

  }


  /**
   * ==========================================================
   * CERRAR DETALLE
   * ==========================================================
   */

  closeDetailModal(): void {

    this.showDetailModal =
      false;


    this.selectedUser =
      null;

  }


  /**
   * ==========================================================
   * CANCELAR FORMULARIO
   * ==========================================================
   */

  cancelForm(): void {

    if (this.saving) {

      return;

    }


    this.resetForm();

  }


  /**
   * ==========================================================
   * REINICIAR FORMULARIO
   * ==========================================================
   */

  resetForm(): void {

    this.showForm =
      false;


    this.editingUserId =
      null;


    this.resetFormValues();

  }


  /**
   * ==========================================================
   * REINICIAR VALORES
   * ==========================================================
   *
   * Restablece todos los valores editables del formulario.
   * ==========================================================
   */

  private resetFormValues(): void {

    this.form = {

      name:
        '',

      email:
        '',

      phone:
        '',

      password:
        ''

    };


    this.selectedFile =
      null;


    this.selectedFileName =
      '';


    this.resetSelectedProfiles();

  }


  /**
   * ==========================================================
   * ELIMINAR USUARIO
   * ==========================================================
   *
   * DELETE /api/users/{id}
   * ==========================================================
   */

  deleteUser(
    user: User
  ): void {

    if (!user.id) {

      this.showMessage(
        'error',
        'El usuario no tiene un identificador válido.'
      );

      return;

    }


    const confirmed =
      window.confirm(
        `¿Deseas eliminar el usuario "${user.name}"?`
      );


    if (!confirmed) {

      return;

    }


    const userId =
      String(
        user.id
      );


    this.userService
      .deleteUser(
        userId
      )
      .subscribe({

        /**
         * ----------------------------------------------------
         * ELIMINACIÓN CORRECTA
         * ----------------------------------------------------
         */

        next:
          (
            response: {
              message: string
            }
          ) => {

            this.users =
              this.users.filter(

                (
                  item: User
                ): boolean => {

                  return String(
                    item.id ?? ''
                  ) !== userId;

                }

              );


            /**
             * ------------------------------------------------
             * CERRAR DETALLE
             * ------------------------------------------------
             */

            if (

              this.selectedUser &&

              String(
                this.selectedUser.id ?? ''
              ) === userId

            ) {

              this.closeDetailModal();

            }


            this.showMessage(
              'success',
              response.message ||
              'Usuario eliminado correctamente.'
            );

          },


        /**
         * ----------------------------------------------------
         * ERROR
         * ----------------------------------------------------
         */

        error:
          (error: unknown) => {

            console.error(
              'Error al eliminar usuario:',
              error
            );


            this.handleApiError(
              error,
              'No fue posible eliminar el usuario.'
            );

          }

      });

  }


  /**
   * ==========================================================
   * VALIDAR CORREO ELECTRÓNICO
   * ==========================================================
   */

  private isValidEmail(
    email: string
  ): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(
        email
      );

  }


  /**
   * ==========================================================
   * VALIDAR TELÉFONO
   * ==========================================================
   *
   * Formato:
   *
   *     +523141234567
   * ==========================================================
   */

  private isValidPhone(
    phone: string
  ): boolean {

    return /^\+[1-9]\d{7,14}$/
      .test(
        phone
      );

  }


  /**
   * ==========================================================
   * LIMPIAR VALOR
   * ==========================================================
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


  /**
   * ==========================================================
   * MANEJO DE ERRORES DE LA API
   * ==========================================================
   *
   * Prioridad:
   *
   * 1. Errores de validación HTTP 422.
   * 2. Mensaje enviado por Laravel.
   * 3. Mensaje genérico.
   * ==========================================================
   */

  private handleApiError(

    error:
      unknown,

    fallbackMessage:
      string

  ): void {

    const apiError =
      error as {

        status?: number;

        error?: {

          message?: string;

          errors?:
            Record<
              string,
              string[]
            >;

        };

      };


    /**
     * --------------------------------------------------------
     * VALIDACIÓN 422
     * --------------------------------------------------------
     */

    if (

      apiError.status === 422 &&

      apiError.error?.errors

    ) {

      const errors =
        apiError.error.errors;


      const fields =
        Object.keys(
          errors
        );


      const firstField =
        fields[0];


      const firstError =
        firstField
          ? errors[firstField]?.[0]
          : '';


      if (firstError) {

        this.showMessage(
          'error',
          firstError
        );

        return;

      }

    }


    /**
     * --------------------------------------------------------
     * MENSAJE DEL BACKEND
     * --------------------------------------------------------
     */

    if (
      apiError.error?.message
    ) {

      this.showMessage(
        'error',
        apiError.error.message
      );

      return;

    }


    /**
     * --------------------------------------------------------
     * MENSAJE GENERAL
     * --------------------------------------------------------
     */

    this.showMessage(
      'error',
      fallbackMessage
    );

  }


  /**
   * ==========================================================
   * MOSTRAR MENSAJE
   * ==========================================================
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


  /**
   * ==========================================================
   * LIMPIAR MENSAJE
   * ==========================================================
   */

  clearMessage(): void {

    this.message =
      '';

  }


  /**
   * ==========================================================
   * EXPORTAR A EXCEL
   * ==========================================================
   *
   * La contraseña nunca se exporta.
   * ==========================================================
   */

  exportToExcel(): void {

    if (
      this.users.length === 0
    ) {

      this.showMessage(
        'info',
        'No existen usuarios para exportar.'
      );

      return;

    }


    const data =
      this.users.map(

        (
          user: User
        ) => ({

          Código:
            user.code ?? '',

          Usuario:
            user.email ?? '',

          Nombre:
            user.name ?? '',

          Teléfono:
            user.phone ?? '',

          Perfiles:
            this.getUserProfileNames(user),

          'Códigos de perfil':
            this.getUserProfileCodes(user),

          'Fecha de creación':
            user.created_at

              ? new Date(
                  user.created_at
                ).toLocaleString(
                  'es-MX'
                )

              : ''

        })

      );


    const worksheet =
      XLSX.utils.json_to_sheet(
        data
      );


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(

      workbook,

      worksheet,

      'Usuarios'

    );


    XLSX.writeFile(

      workbook,

      'usuarios-tap-terminal.xlsx'

    );


    this.showMessage(
      'success',
      'Archivo Excel generado correctamente.'
    );

  }


  /**
   * ==========================================================
   * EXPORTAR A PDF
   * ==========================================================
   */

  exportToPDF(): void {

    if (
      this.users.length === 0
    ) {

      this.showMessage(
        'info',
        'No existen usuarios para exportar.'
      );

      return;

    }


    const doc =
      new jsPDF();


    /**
     * --------------------------------------------------------
     * ENCABEZADO
     * --------------------------------------------------------
     */

    doc.setFontSize(
      18
    );


    doc.text(
      'TAP Terminal',
      14,
      18
    );


    doc.setFontSize(
      11
    );


    doc.text(
      'Listado de usuarios',
      14,
      26
    );


    doc.setFontSize(
      9
    );


    doc.text(

      `Generado: ${new Date().toLocaleString('es-MX')}`,

      14,

      33

    );


    /**
     * --------------------------------------------------------
     * CABECERAS
     * --------------------------------------------------------
     */

    const head:
      string[][] = [

        [

          'Código',

          'Usuario',

          'Nombre',

          'Teléfono',

          'Perfiles',

          'Fecha de creación'

        ]

      ];


    /**
     * --------------------------------------------------------
     * CUERPO
     * --------------------------------------------------------
     */

    const body:
      string[][] =

      this.users.map(

        (
          user: User
        ): string[] => [

          String(
            user.code ?? ''
          ),

          String(
            user.email ?? ''
          ),

          String(
            user.name ?? ''
          ),

          String(
            user.phone ?? '—'
          ),

          this.getUserProfileNames(
            user
          ),

          user.created_at

            ? new Date(
                user.created_at
              ).toLocaleString(
                'es-MX'
              )

            : '—'

        ]

      );


    /**
     * --------------------------------------------------------
     * TABLA
     * --------------------------------------------------------
     */

    autoTable(

      doc,

      {

        head,

        body,

        startY:
          40,

        theme:
          'grid',

        styles: {

          fontSize:
            7,

          cellPadding:
            3,

          overflow:
            'linebreak'

        },

        headStyles: {

          fontSize:
            7

        }

      }

    );


    /**
     * --------------------------------------------------------
     * GUARDAR
     * --------------------------------------------------------
     */

    doc.save(
      'usuarios-tap-terminal.pdf'
    );


    this.showMessage(
      'success',
      'Archivo PDF generado correctamente.'
    );

  }

}