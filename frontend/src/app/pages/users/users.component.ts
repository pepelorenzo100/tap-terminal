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
  Router
} from '@angular/router';

import {
  User,
  UserResponse,
  UserService
} from '../../services/user.service';

import {
  AuthService
} from '../../services/auth.service';

import * as XLSX from 'xlsx';

import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';


/**
 * ============================================================
 * TAP TERMINAL
 * USERS COMPONENT
 * ============================================================
 *
 * Responsabilidad:
 *
 * Administrar la pantalla de usuarios.
 *
 * Funcionalidades:
 *
 * - Listar usuarios.
 * - Crear usuarios.
 * - Editar usuarios.
 * - Eliminar usuarios.
 * - Ver detalle.
 * - Subir fotografía.
 * - Exportar Excel.
 * - Exportar PDF.
 * - Cerrar sesión.
 *
 * API:
 *
 *     GET    /api/users
 *     POST   /api/users
 *     GET    /api/users/{id}
 *     PUT    /api/users/{id}
 *     DELETE /api/users/{id}
 *
 * La autenticación es gestionada por AuthInterceptor.
 *
 * ============================================================
 */

@Component({
  selector: 'app-users',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './users.component.html',

  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {


  /* ==========================================================
     USUARIOS
     ========================================================== */

  users: User[] = [];


  /* ==========================================================
     FORMULARIO
     ========================================================== */

  showForm = false;

  editingUserId: string | null = null;


  form = {
    name: '',
    email: '',
    phone: '',
    password: ''
  };


  /* ==========================================================
     FOTO
     ========================================================== */

  selectedFile: File | null = null;

  selectedFileName = '';


  /* ==========================================================
     USUARIO SELECCIONADO
     ========================================================== */

  selectedUser: User | null = null;

  showDetailModal = false;


  /* ==========================================================
     MENSAJES
     ========================================================== */

  message = '';

  messageType:
    'success' |
    'error' |
    'info' = 'info';


  /* ==========================================================
     ESTADO
     ========================================================== */

  saving = false;


  /* ==========================================================
     CONSTRUCTOR
     ========================================================== */

  constructor(

    private readonly userService:
      UserService,

    private readonly authService:
      AuthService,

    private readonly router:
      Router

  ) {}


  /* ==========================================================
     INICIALIZACIÓN
     ========================================================== */

  ngOnInit(): void {

    this.loadUsers();

  }


  /* ==========================================================
     CARGAR USUARIOS
     ========================================================== */

  loadUsers(): void {

    this.userService
      .getUsers()
      .subscribe({

        next:
          (response: UserResponse) => {

            if (Array.isArray(response.data)) {

              this.users =
                response.data;

            } else {

              this.users = [];

            }

          },

        error:
          (error: unknown) => {

            console.error(
              'Error al cargar usuarios:',
              error
            );

            this.showMessage(
              'error',
              'No fue posible cargar los usuarios.'
            );

          }

      });

  }


  /* ==========================================================
     NUEVO USUARIO
     ========================================================== */

  showCreateForm(): void {

    this.editingUserId =
      null;

    this.form = {

      name: '',

      email: '',

      phone: '',

      password: ''

    };

    this.selectedFile =
      null;

    this.selectedFileName =
      '';

    this.showForm =
      true;

    this.clearMessage();

  }


  /* ==========================================================
     SELECCIONAR FOTO
     ========================================================== */

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

      input.value = '';

      this.selectedFile =
        null;

      this.selectedFileName =
        '';

      return;

    }


    if (
      file.size > 2 * 1024 * 1024
    ) {

      this.showMessage(
        'error',
        'La fotografía no puede superar 2 MB.'
      );

      input.value = '';

      this.selectedFile =
        null;

      this.selectedFileName =
        '';

      return;

    }


    this.selectedFile =
      file;

    this.selectedFileName =
      file.name;

  }


  /* ==========================================================
     GUARDAR USUARIO
     ========================================================== */

  saveUser(): void {

    const name =
      String(
        this.form.name ?? ''
      ).trim();


    if (!name) {

      this.showMessage(
        'error',
        'El nombre es obligatorio.'
      );

      return;

    }


    const email =
      String(
        this.form.email ?? ''
      ).trim();


    if (!email) {

      this.showMessage(
        'error',
        'El correo electrónico es obligatorio.'
      );

      return;

    }


    if (
      !this.isValidEmail(email)
    ) {

      this.showMessage(
        'error',
        'Introduce un correo electrónico válido.'
      );

      return;

    }


    const phone =
      String(
        this.form.phone ?? ''
      ).trim();


    if (
      phone &&
      !this.isValidPhone(phone)
    ) {

      this.showMessage(
        'error',
        'El teléfono debe incluir código de país, por ejemplo +523141234567.'
      );

      return;

    }


    if (
      this.editingUserId === null &&
      !this.form.password
    ) {

      this.showMessage(
        'error',
        'La contraseña es obligatoria para crear un usuario.'
      );

      return;

    }


    if (
      this.editingUserId === null &&
      this.form.password.length < 8
    ) {

      this.showMessage(
        'error',
        'La contraseña debe tener al menos 8 caracteres.'
      );

      return;

    }


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


    const formData =
      new FormData();


    formData.append(
      'name',
      name
    );


    formData.append(
      'email',
      email
    );


    if (phone) {

      formData.append(
        'phone',
        phone
      );

    }


    if (
      this.form.password
    ) {

      formData.append(
        'password',
        this.form.password
      );

    }


    if (
      this.selectedFile
    ) {

      formData.append(
        'profile_photo',
        this.selectedFile
      );

    }


    this.saving =
      true;


    /* ========================================================
       CREAR
       ======================================================== */

    if (
      this.editingUserId === null
    ) {

      this.userService
        .createUser(formData)
        .subscribe({

          next:
            (response: UserResponse) => {

              if (
                !Array.isArray(response.data)
              ) {

                this.users = [

                  ...this.users,

                  response.data

                ];

              }


              this.showMessage(
                'success',
                'Usuario creado correctamente.'
              );


              this.resetForm();

              this.saving =
                false;

            },

          error:
            (error: any) => {

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

            }

        });


      return;

    }


    /* ========================================================
       ACTUALIZAR
       ======================================================== */

    const userId =
      this.editingUserId;


    this.userService
      .updateUser(
        userId,
        formData
      )
      .subscribe({

        next:
          (response: UserResponse) => {

            if (
              !Array.isArray(response.data)
            ) {

              this.users =
                this.users.map(

                  (user: User) => {

                    if (
                      String(
                        user.id ?? ''
                      ) === userId
                    ) {

                      return response.data as User;

                    }

                    return user;

                  }

                );

            }


            this.showMessage(
              'success',
              'Usuario actualizado correctamente.'
            );


            this.resetForm();

            this.saving =
              false;

          },

        error:
          (error: any) => {

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

          }

      });

  }


  /* ==========================================================
     EDITAR
     ========================================================== */

  editUser(
    user: User
  ): void {

    this.closeDetailModal();


    if (
      !user.id
    ) {

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

      password: ''

    };


    this.selectedFile =
      null;

    this.selectedFileName =
      '';


    this.showForm =
      true;

    this.clearMessage();

  }


  /* ==========================================================
     VER DETALLE
     ========================================================== */

  viewUser(
    user: User
  ): void {

    this.selectedUser =
      user;

    this.showDetailModal =
      true;

  }


  /* ==========================================================
     CERRAR MODAL
     ========================================================== */

  closeDetailModal(): void {

    this.showDetailModal =
      false;

    this.selectedUser =
      null;

  }


  /* ==========================================================
     CANCELAR
     ========================================================== */

  cancelForm(): void {

    this.resetForm();

  }


  /* ==========================================================
     RESET
     ========================================================== */

  resetForm(): void {

    this.showForm =
      false;

    this.editingUserId =
      null;

    this.form = {

      name: '',

      email: '',

      phone: '',

      password: ''

    };

    this.selectedFile =
      null;

    this.selectedFileName =
      '';

  }


  /* ==========================================================
     ELIMINAR
     ========================================================== */

  deleteUser(
    user: User
  ): void {

    if (
      !user.id
    ) {

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
      .deleteUser(userId)
      .subscribe({

        next:
          () => {

            this.users =
              this.users.filter(

                (item: User) => {

                  return String(
                    item.id ?? ''
                  ) !== userId;

                }

              );


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
              'Usuario eliminado correctamente.'
            );

          },

        error:
          (error: unknown) => {

            console.error(
              'Error al eliminar usuario:',
              error
            );

            this.showMessage(
              'error',
              'No fue posible eliminar el usuario.'
            );

          }

      });

  }


  /* ==========================================================
     VALIDAR EMAIL
     ========================================================== */

  private isValidEmail(
    email: string
  ): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(email);

  }


  /* ==========================================================
     VALIDAR TELÉFONO
     ========================================================== */

  private isValidPhone(
    phone: string
  ): boolean {

    return /^\+[1-9]\d{7,14}$/
      .test(phone);

  }


  /* ==========================================================
     ERRORES DE API
     ========================================================== */

  private handleApiError(
    error: any,
    fallbackMessage: string
  ): void {

    if (
      error?.status === 422 &&
      error?.error?.errors
    ) {

      const errors =
        error.error.errors;


      const firstField =
        Object.keys(errors)[0];


      if (
        firstField &&
        errors[firstField]?.[0]
      ) {

        this.showMessage(
          'error',
          errors[firstField][0]
        );

        return;

      }

    }


    this.showMessage(
      'error',
      fallbackMessage
    );

  }


  /* ==========================================================
     MENSAJES
     ========================================================== */

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


  clearMessage(): void {

    this.message =
      '';

  }


  /* ==========================================================
     LOGOUT
     ========================================================== */

  logout(): void {

    this.authService
      .logout()
      .subscribe({

        next:
          () => {

            this.authService
              .clearToken();

            this.router
              .navigate([
                '/login'
              ]);

          },

        error:
          (error: unknown) => {

            console.error(
              'Error al cerrar sesión:',
              error
            );

            this.authService
              .clearToken();

            this.router
              .navigate([
                '/login'
              ]);

          }

      });

  }


  /* ==========================================================
     EXCEL
     ========================================================== */

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

        (user: User) => ({

          Código:
            user.code ?? '',

          Usuario:
            user.email ?? '',

          Nombre:
            user.name ?? '',

          Teléfono:
            user.phone ?? '',

          'Fecha de creación':
            user.created_at
              ? new Date(
                  user.created_at
                ).toLocaleString('es-MX')
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


  /* ==========================================================
     PDF
     ========================================================== */

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


    const head:
      string[][] = [

        [

          'Código',

          'Usuario',

          'Nombre',

          'Teléfono',

          'Fecha de creación'

        ]

      ];


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

          user.created_at

            ? new Date(
                user.created_at
              ).toLocaleString('es-MX')

            : '—'

        ]

      );


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
            3

        },

        headStyles: {

          fontSize:
            7

        }

      }

    );


    doc.save(
      'usuarios-tap-terminal.pdf'
    );


    this.showMessage(
      'success',
      'Archivo PDF generado correctamente.'
    );

  }

}
