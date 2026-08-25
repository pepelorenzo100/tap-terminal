/**
 * ============================================================
 * TAP TERMINAL
 * PANTALLA DE PERFILES DE AUTORIZACIÓN
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/pages/profiles/profiles.component.ts
 *
 * Responsabilidad:
 *
 * Administrar los perfiles de autorización desde Angular.
 *
 * Funcionalidades:
 *
 * - Consultar perfiles.
 * - Consultar secciones dinámicas.
 * - Crear perfiles.
 * - Editar perfiles.
 * - Consultar detalle.
 * - Eliminar perfiles.
 * - Seleccionar secciones.
 * - Exportar perfiles a Excel.
 * - Exportar perfiles a PDF.
 * - Mostrar mensajes de operación.
 * - Controlar estados de carga.
 * - Controlar estados de guardado.
 *
 * API utilizada:
 *
 *     GET    /api/access-profiles
 *     POST   /api/access-profiles
 *     GET    /api/access-profiles/{id}
 *     PUT    /api/access-profiles/{id}
 *     DELETE /api/access-profiles/{id}
 *     GET    /api/sections
 *
 * Seguridad:
 *
 * El AuthInterceptor agrega automáticamente el token Bearer
 * a las peticiones HTTP.
 *
 * La autorización real continúa siendo responsabilidad
 * del backend Laravel.
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
  AccessProfile
} from '../../models/auth';

import {
  AccessProfilePayload,
  AccessProfileService
} from '../../services/access-profile.service';

import {
  Section,
  SectionService
} from '../../services/section.service';

import * as XLSX from 'xlsx';

import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';


/**
 * ============================================================
 * COMPONENTE
 * ============================================================
 */

@Component({

  selector: 'app-profiles',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './profiles.component.html',

  styleUrl:
    './profiles.component.css'

})


export class ProfilesComponent
  implements OnInit {


  /**
   * ==========================================================
   * ESTADOS DE LA PANTALLA
   * ==========================================================
   */

  loading = false;

  loadingSections = false;

  saving = false;

  deleting = false;


  /**
   * ==========================================================
   * MENSAJES
   * ==========================================================
   */

  errorMessage = '';

  successMessage = '';


  /**
   * ==========================================================
   * LISTAS
   * ==========================================================
   */

  profiles: AccessProfile[] = [];

  sections: Section[] = [];


  /**
   * ==========================================================
   * FORMULARIO DE CREACIÓN
   * ==========================================================
   */

  showCreateForm = false;

  newProfileName = '';

  newProfileDescription = '';

  selectedSectionIds: string[] = [];


  /**
   * ==========================================================
   * FORMULARIO DE EDICIÓN
   * ==========================================================
   */

  showEditForm = false;

  editingProfile:
    AccessProfile | null = null;

  editProfileName = '';

  editProfileDescription = '';

  editSelectedSectionIds: string[] = [];


  /**
   * ==========================================================
   * DETALLE
   * ==========================================================
   */

  showDetail = false;

  selectedProfile:
    AccessProfile | null = null;


  /**
   * ==========================================================
   * CONSTRUCTOR
   * ==========================================================
   */

  constructor(

    private readonly accessProfileService:
      AccessProfileService,

    private readonly sectionService:
      SectionService

  ) {}


  /**
   * ==========================================================
   * INICIALIZACIÓN
   * ==========================================================
   */

  ngOnInit(): void {

    this.loadProfiles();

    this.loadSections();

  }


  /**
   * ==========================================================
   * CARGAR PERFILES
   * ==========================================================
   *
   * GET /api/access-profiles
   */

  loadProfiles(): void {

    this.errorMessage = '';

    this.loading = true;

    this.accessProfileService
      .getAll()
      .subscribe({

        next: (response) => {

          this.profiles =
            response.data ?? [];

        },

        error: (error: Error) => {

          console.error(
            'Error al cargar perfiles:',
            error
          );

          this.profiles = [];

          this.errorMessage =
            error.message;

          this.loading = false;

        },

        complete: () => {

          this.loading = false;

        }

      });

  }


  /**
   * ==========================================================
   * CARGAR SECCIONES
   * ==========================================================
   *
   * GET /api/sections
   *
   * Las secciones son dinámicas.
   */

  loadSections(): void {

    this.loadingSections = true;

    this.sectionService
      .getSections()
      .subscribe({

        next: (response) => {

          this.sections =
            response.data ?? [];

        },

        error: (error: Error) => {

          console.error(
            'Error al cargar secciones:',
            error
          );

          this.sections = [];

          this.errorMessage =
            error.message;

          this.loadingSections = false;

        },

        complete: () => {

          this.loadingSections = false;

        }

      });

  }


  /**
   * ==========================================================
   * FORMULARIO DE CREACIÓN
   * ==========================================================
   */

  openCreateForm(): void {

    this.closeDetail();

    this.closeEditForm();

    this.clearMessages();

    this.resetCreateForm();

    this.showCreateForm = true;

  }


  /**
   * ==========================================================
   * CERRAR CREACIÓN
   * ==========================================================
   */

  closeCreateForm(): void {

    if (this.saving) {

      return;

    }

    this.showCreateForm = false;

    this.resetCreateForm();

  }


  /**
   * ==========================================================
   * REINICIAR FORMULARIO DE CREACIÓN
   * ==========================================================
   */

  resetCreateForm(): void {

    this.newProfileName = '';

    this.newProfileDescription = '';

    this.selectedSectionIds = [];

  }


  /**
   * ==========================================================
   * SELECCIÓN DE SECCIONES PARA CREACIÓN
   * ==========================================================
   */

  isSectionSelected(
    sectionId: string
  ): boolean {

    return this.selectedSectionIds
      .includes(sectionId);

  }


  /**
   * ==========================================================
   * CAMBIAR SECCIÓN DE CREACIÓN
   * ==========================================================
   */

  toggleSection(
    sectionId: string
  ): void {

    const index =
      this.selectedSectionIds
        .indexOf(sectionId);


    if (index >= 0) {

      this.selectedSectionIds
        .splice(index, 1);

      return;

    }


    this.selectedSectionIds
      .push(sectionId);

  }


  /**
   * ==========================================================
   * CREAR PERFIL
   * ==========================================================
   *
   * POST /api/access-profiles
   *
   * El código del perfil es generado por Laravel.
   */

  createProfile(): void {

    this.clearMessages();


    if (this.saving) {

      return;

    }


    const name =
      this.newProfileName.trim();


    if (!name) {

      this.errorMessage =
        'Ingresa el nombre del perfil.';

      return;

    }


    const payload:
      AccessProfilePayload = {

      name,

      description:
        this.newProfileDescription
          .trim() || null,

      section_ids:
        [...this.selectedSectionIds]

    };


    this.saving = true;


    this.accessProfileService
      .create(payload)
      .subscribe({

        next: (response) => {

          this.successMessage =
            response.message ||
            'Perfil creado correctamente.';

          this.showCreateForm = false;

          this.resetCreateForm();

          this.loadProfiles();

        },

        error: (error: Error) => {

          console.error(
            'Error al crear perfil:',
            error
          );

          this.errorMessage =
            error.message;

          this.saving = false;

        },

        complete: () => {

          this.saving = false;

        }

      });

  }


  /**
   * ==========================================================
   * DETALLE
   * ==========================================================
   */

  viewProfile(
    profile: AccessProfile
  ): void {

    this.clearMessages();

    this.closeCreateForm();

    this.closeEditForm();

    this.selectedProfile = profile;

    this.showDetail = true;

  }


  /**
   * ==========================================================
   * CERRAR DETALLE
   * ==========================================================
   */

  closeDetail(): void {

    this.showDetail = false;

    this.selectedProfile = null;

  }


  /**
   * ==========================================================
   * ABRIR EDICIÓN
   * ==========================================================
   */

  editProfile(
    profile: AccessProfile
  ): void {

    this.clearMessages();

    this.closeDetail();

    this.closeCreateForm();

    this.editingProfile = profile;

    this.editProfileName =
      profile.name ?? '';

    this.editProfileDescription =
      profile.description ?? '';

    this.editSelectedSectionIds =
      profile.section_ids
        ? [...profile.section_ids]
        : (
          profile.sections
            ?.map(section => section.id)
            ?? []
        );

    this.showEditForm = true;

  }


  /**
   * ==========================================================
   * CERRAR EDICIÓN
   * ==========================================================
   */

  closeEditForm(): void {

    if (this.saving) {

      return;

    }

    this.showEditForm = false;

    this.editingProfile = null;

    this.editProfileName = '';

    this.editProfileDescription = '';

    this.editSelectedSectionIds = [];

  }


  /**
   * ==========================================================
   * SECCIÓN SELECCIONADA EN EDICIÓN
   * ==========================================================
   */

  isEditSectionSelected(
    sectionId: string
  ): boolean {

    return this.editSelectedSectionIds
      .includes(sectionId);

  }


  /**
   * ==========================================================
   * CAMBIAR SECCIÓN EN EDICIÓN
   * ==========================================================
   */

  toggleEditSection(
    sectionId: string
  ): void {

    const index =
      this.editSelectedSectionIds
        .indexOf(sectionId);


    if (index >= 0) {

      this.editSelectedSectionIds
        .splice(index, 1);

      return;

    }


    this.editSelectedSectionIds
      .push(sectionId);

  }


  /**
   * ==========================================================
   * ACTUALIZAR PERFIL
   * ==========================================================
   *
   * PUT /api/access-profiles/{id}
   */

  updateProfile(): void {

    this.saveEditProfile();

  }


  /**
   * ==========================================================
   * GUARDAR EDICIÓN
   * ==========================================================
   */

  saveEditProfile(): void {

    this.clearMessages();


    if (this.saving) {

      return;

    }


    if (!this.editingProfile) {

      this.errorMessage =
        'No hay un perfil seleccionado para editar.';

      return;

    }


    const name =
      this.editProfileName.trim();


    if (!name) {

      this.errorMessage =
        'Ingresa el nombre del perfil.';

      return;

    }


    const payload:
      AccessProfilePayload = {

      name,

      description:
        this.editProfileDescription
          .trim() || null,

      section_ids:
        [...this.editSelectedSectionIds]

    };


    this.saving = true;


    this.accessProfileService
      .update(
        this.editingProfile.id,
        payload
      )
      .subscribe({

        next: (response) => {

          this.successMessage =
            response.message ||
            'Perfil actualizado correctamente.';

          this.showEditForm = false;

          this.editingProfile = null;

          this.editProfileName = '';

          this.editProfileDescription = '';

          this.editSelectedSectionIds = [];

          this.loadProfiles();

        },

        error: (error: Error) => {

          console.error(
            'Error al actualizar perfil:',
            error
          );

          this.errorMessage =
            error.message;

          this.saving = false;

        },

        complete: () => {

          this.saving = false;

        }

      });

  }


  /**
   * ==========================================================
   * ELIMINAR PERFIL
   * ==========================================================
   *
   * DELETE /api/access-profiles/{id}
   */

  deleteProfile(
    profile: AccessProfile
  ): void {

    this.clearMessages();


    if (this.deleting) {

      return;

    }


    const confirmed =
      window.confirm(
        `¿Eliminar el perfil "${profile.name}" (${profile.code})?`
      );


    if (!confirmed) {

      return;

    }


    this.deleting = true;


    this.accessProfileService
      .delete(profile.id)
      .subscribe({

        next: (response) => {

          this.successMessage =
            response.message ||
            'Perfil eliminado correctamente.';

          this.loadProfiles();

        },

        error: (error: Error) => {

          console.error(
            'Error al eliminar perfil:',
            error
          );

          this.errorMessage =
            error.message;

          this.deleting = false;

        },

        complete: () => {

          this.deleting = false;

        }

      });

  }


  /**
   * ==========================================================
   * OBTENER NÚMERO DE SECCIONES
   * ==========================================================
   */

  getSectionCount(
    profile: AccessProfile
  ): number {

    return profile.sections?.length ?? 0;

  }


  /**
   * ==========================================================
   * OBTENER NOMBRES DE SECCIONES
   * ==========================================================
   */

  getSectionNames(
    profile: AccessProfile
  ): string {

    const names =
      profile.sections
        ?.map(section => section.name)
        .filter(Boolean)
        .join(', ');


    return names || 'Sin secciones';

  }


  /**
   * ==========================================================
   * FORMATEAR FECHA
   * ==========================================================
   */

  formatDate(
    value: string | null | undefined
  ): string {

    if (!value) {

      return '—';

    }


    const date =
      new Date(value);


    if (Number.isNaN(date.getTime())) {

      return '—';

    }


    return date.toLocaleString(
      'es-MX',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  }


  /**
   * ==========================================================
   * EXPORTAR A EXCEL
   * ==========================================================
   */

  exportToExcel(): void {

    if (this.profiles.length === 0) {

      this.errorMessage =
        'No existen perfiles para exportar.';

      return;

    }


    const data =
      this.profiles.map(
        (profile: AccessProfile) => ({

          Código:
            profile.code ?? '',

          Nombre:
            profile.name ?? '',

          Descripción:
            profile.description ?? '',

          Secciones:
            this.getSectionNames(profile),

          'Número de secciones':
            this.getSectionCount(profile),

          'Fecha de creación':
            profile.created_at
              ? this.formatDate(profile.created_at)
              : ''

        })
      );


    const worksheet =
      XLSX.utils.json_to_sheet(data);


    worksheet['!cols'] = [

      { wch: 20 },

      { wch: 25 },

      { wch: 45 },

      { wch: 50 },

      { wch: 20 },

      { wch: 24 }

    ];


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Perfiles'
    );


    XLSX.writeFile(
      workbook,
      'perfiles-tap-terminal.xlsx'
    );


    this.successMessage =
      'Archivo Excel generado correctamente.';

  }


  /**
   * ==========================================================
   * EXPORTAR A PDF
   * ==========================================================
   */

  exportToPDF(): void {

    if (this.profiles.length === 0) {

      this.errorMessage =
        'No existen perfiles para exportar.';

      return;

    }


    const doc =
      new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });


    doc.setFontSize(18);

    doc.text(
      'TAP Terminal',
      14,
      18
    );


    doc.setFontSize(12);

    doc.text(
      'Listado de perfiles de autorización',
      14,
      26
    );


    doc.setFontSize(9);

    doc.text(
      `Generado: ${new Date().toLocaleString('es-MX')}`,
      14,
      33
    );


    const head: string[][] = [[

      'Código',

      'Nombre',

      'Descripción',

      'Secciones',

      'Creación'

    ]];


    const body: string[][] =
      this.profiles.map(
        (profile: AccessProfile) => [

          profile.code ?? '',

          profile.name ?? '',

          profile.description ??
            'Sin descripción',

          this.getSectionNames(profile),

          profile.created_at
            ? this.formatDate(profile.created_at)
            : '—'

        ]
      );


    autoTable(
      doc,
      {
        head,
        body,
        startY: 40,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak'
        },
        headStyles: {
          fontSize: 8
        },
        columnStyles: {
          0: {
            cellWidth: 30
          },
          1: {
            cellWidth: 35
          },
          2: {
            cellWidth: 65
          },
          3: {
            cellWidth: 90
          },
          4: {
            cellWidth: 40
          }
        }
      }
    );


    doc.save(
      'perfiles-tap-terminal.pdf'
    );


    this.successMessage =
      'Archivo PDF generado correctamente.';

  }


  /**
   * ==========================================================
   * LIMPIAR MENSAJES
   * ==========================================================
   */

  private clearMessages(): void {

    this.errorMessage = '';

    this.successMessage = '';

  }

}