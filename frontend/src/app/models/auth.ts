/**
 * ============================================================
 * TAP TERMINAL
 * MODELOS DE AUTENTICACIÓN
 * ============================================================
 *
 * Archivo:
 * auth.ts
 *
 * Responsabilidad:
 *
 * Define las estructuras de datos utilizadas por Angular
 * durante el proceso de autenticación con Laravel Sanctum.
 *
 * Flujo:
 *
 * AuthService
 *      ↓
 * API Laravel
 *      ↓
 * AuthController
 *      ↓
 * Sanctum
 *      ↓
 * AuthResponse
 *
 * ============================================================
 */

/**
 * ============================================================
 * USUARIO AUTENTICADO
 * ============================================================
 *
 * Representa los datos públicos del usuario devueltos
 * por Laravel.
 *
 * La contraseña NO forma parte de este modelo.
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
 * RESPUESTA DE LOGIN
 * ============================================================
 *
 * Laravel responde con:
 *
 * {
 *   message: "...",
 *   data: {
 *     user: {...},
 *     token: "...",
 *     token_type: "Bearer"
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
 * El endpoint /api/me devuelve:
 *
 * {
 *   message: "...",
 *   data: {...}
 * }
 */

export interface MeResponse {
  message: string;
  data: AuthUser;
}


/**
 * ============================================================
 * RESPUESTA DE LOGOUT
 * ============================================================
 */

export interface LogoutResponse {
  message: string;
}