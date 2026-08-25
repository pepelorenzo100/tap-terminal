/**
 * ============================================================
 * TAP TERMINAL
 * MODELOS DE AUTENTICACIÓN Y AUTORIZACIÓN
 * ============================================================
 *
 * Archivo:
 *
 *     frontend/src/app/models/auth.ts
 *
 * Responsabilidad:
 *
 * Definir las estructuras TypeScript utilizadas para:
 *
 * - Login.
 * - Usuario autenticado.
 * - Perfiles de autorización.
 * - Secciones permitidas.
 * - Logout.
 * - Perfiles administrativos.
 *
 * Arquitectura:
 *
 * Angular
 *    ↓
 * AuthService
 *    ↓
 * Laravel API
 *    ↓
 * Sanctum
 *    ↓
 * MongoDB
 *
 * ============================================================
 */


/**
 * ============================================================
 * USUARIO AUTENTICADO
 * ============================================================
 *
 * Representa los datos públicos del usuario.
 *
 * La contraseña nunca forma parte de este modelo.
 */

export interface AuthUser {

  id: string;

  code: string;

  name: string;

  email: string;

  phone: string | null;

  profile_photo: string | null;

  created_at?: string;

  updated_at?: string;
}


/**
 * ============================================================
 * PERFIL DE AUTORIZACIÓN
 * ============================================================
 *
 * Representa un perfil de autorización.
 *
 * Ejemplo:
 *
 *     PRF-ADMIN
 *     Administrador
 *
 * Laravel devuelve además las fechas y las secciones
 * asociadas al perfil.
 */

export interface AccessProfile {

  /**
   * Identificador MongoDB.
   */

  id: string;


  /**
   * Código generado por Laravel.
   *
   * Ejemplo:
   *
   *     PRF-000001
   */

  code: string;


  /**
   * Nombre del perfil.
   */

  name: string;


  /**
   * Descripción del perfil.
   */

  description: string | null;


  /**
   * Fecha de creación.
   */

  created_at?: string;


  /**
   * Fecha de actualización.
   */

  updated_at?: string;


  /**
   * IDs de las secciones asociadas.
   */

  section_ids?: string[];


  /**
   * Secciones completas asociadas al perfil.
   *
   * Laravel las devuelve mediante:
   *
   *     $profile->sections()
   */

  sections?: Section[];
}


/**
 * ============================================================
 * SECCIÓN AUTORIZADA
 * ============================================================
 *
 * Representa una sección funcional del sistema.
 *
 * Ejemplos:
 *
 *     SEC-DASHBOARD
 *     SEC-PRODUCTS
 *     SEC-USERS
 *     SEC-PROFILES
 */

export interface Section {

  id: string;

  code: string;

  name: string;

  description: string | null;

  route: string;
}


/**
 * ============================================================
 * RESPUESTA DE LOGIN
 * ============================================================
 *
 * Laravel responde:
 *
 * {
 *   message: "...",
 *
 *   data: {
 *
 *     user: {...},
 *
 *     token: "...",
 *
 *     token_type: "Bearer"
 *
 *   }
 * }
 */

export interface AuthResponse {

  message: string;

  data: {

    user: AuthUser;

    token: string;

    token_type: string;

  };
}


/**
 * ============================================================
 * RESPUESTA /api/me
 * ============================================================
 *
 * Laravel responde:
 *
 * {
 *   message: "...",
 *
 *   data: {
 *
 *     user: {...},
 *
 *     access_profiles: [
 *       {...}
 *     ],
 *
 *     sections: [
 *       {...}
 *     ]
 *
 *   }
 * }
 */

export interface MeResponse {

  message: string;

  data: {

    user: AuthUser;

    access_profiles: AccessProfile[];

    sections: Section[];

  };
}


/**
 * ============================================================
 * RESPUESTA DE LOGOUT
 * ============================================================
 */

export interface LogoutResponse {

  message: string;
}