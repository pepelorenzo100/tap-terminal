# TAP Terminal

## Sistema de Administración — Productos, Usuarios, Perfiles y Autenticación

Aplicación web desarrollada para la administración de productos, usuarios y perfiles de acceso, mediante una arquitectura separada de frontend y backend.

El proyecto implementa CRUD completos utilizando Angular, Laravel, PHP y MongoDB, además de un módulo de autenticación con recuperación de contraseña, control de accesos por perfil y bitácora de cambios.

---

# 1. Información del proyecto

**Proyecto:** TAP Terminal
**Módulos:** Productos, Usuarios, Perfiles, Autenticación, Bitácora
**Autor:** Ing. Jose Manuel Lorenzo Martinez
**Presentación:** Evaluación técnica / examen de admisión — Área de Desarrollo

---

# 2. Descripción

TAP Terminal es una aplicación web para la administración de productos y del acceso de usuarios al sistema.

El sistema permite:

- Gestionar productos (CRUD, export Excel/PDF).
- Gestionar usuarios (CRUD, detalle con perfiles relacionados, export Excel/PDF).
- Gestionar perfiles de acceso (CRUD, detalle con secciones relacionadas, export Excel/PDF).
- Autenticar usuarios (login/logout, recuperación de contraseña).
- Restringir el acceso a cada sección según el perfil del usuario.
- Registrar en bitácora los cambios realizados sobre la información (valor anterior vs. actual).

La aplicación está dividida en:

- **Frontend:** Angular 19 + TypeScript 5.0.
- **Backend:** Laravel 11 + PHP 8.2.
- **Base de datos:** MongoDB.

---

# 3. Arquitectura

```
┌──────────────────────────────┐
│           ANGULAR            │
│           FRONTEND           │
└──────────────┬───────────────┘
               │ HTTP / JSON
               ▼
┌──────────────────────────────┐
│      SERVICES (Angular)      │
│  ProductService / UserService│
│  ProfileService / AuthService│
└──────────────┬───────────────┘
               │ REST API
               ▼
┌──────────────────────────────┐
│           LARAVEL             │
│             API               │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          CONTROLLERS          │
│ Product / User / Profile /    │
│ Auth / AuditLog                │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│            MODELS             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│            MONGODB            │
│ products / users / profiles / │
│ audit_logs                    │
└──────────────────────────────┘
```

---

# 4. Tecnologías utilizadas

## Frontend
- Angular 19
- TypeScript 5.0
- HTML / CSS
- Angular Forms
- Angular HttpClient
- Angular Guards (control de accesos por perfil)
- Jasmine / Karma
- SheetJS / XLSX
- jsPDF / jspdf-autotable

## Backend
- PHP 8.2
- Laravel 11
- Laravel REST API
- PHPUnit
- Hashing de contraseñas (bcrypt / Laravel Hash)

## Base de datos
- MongoDB (colecciones: `products`, `users`, `profiles`, `audit_logs`)

## Herramientas de desarrollo
- Visual Studio Code, PowerShell, Google Chrome, npm, Composer
- Postman (documentación de API)

## Sistema operativo
- Windows

---

# 5. Funcionalidades

## Productos
```
CREATE / READ / UPDATE / DELETE
VALIDACIONES
GENERACIÓN AUTOMÁTICA DE CÓDIGO
EXPORTACIÓN EXCEL / PDF
```

## Usuarios
```
CREATE / READ / UPDATE / DELETE
DETALLE DE USUARIO (perfiles relacionados)
FOTO DE PERFIL
TELÉFONO CON CÓDIGO DE PAÍS (opcional)
GENERACIÓN AUTOMÁTICA DE CÓDIGO
EXPORTACIÓN EXCEL / PDF
```

## Perfiles
```
CREATE / READ / UPDATE / DELETE
DETALLE DE PERFIL EN MODAL (secciones relacionadas)
GENERACIÓN AUTOMÁTICA DE CÓDIGO
EXPORTACIÓN EXCEL / PDF
```

## Autenticación
```
LOGIN / LOGOUT
RECUPERACIÓN DE CONTRASEÑA
  - Validación de existencia del usuario
  - Envío de credenciales al correo registrado
```

## Control de accesos
```
Los usuarios solo acceden a las secciones asignadas a su perfil.
```

## Bitácora
```
Registro de valores anteriores y actuales ante cada cambio
en productos, usuarios y perfiles.
```

---

# 6. CRUD de productos

Sin cambios respecto al módulo original: alta, consulta, visualización, edición y eliminación de productos, con generación automática de código y validación de nombre, marca y precio (máx. 3 dígitos).

---

# 7. Usuarios

## 7.1 Alta de usuario

Campos:
```
Nombre        (requerido)
Foto de perfil (requerido)
Usuario        (requerido, correo electrónico único)
Teléfono       (opcional, debe incluir código de país)
```

El código de usuario se genera automáticamente (mismo criterio que productos: ULID).
La fecha de creación se guarda automáticamente.

## 7.2 Consulta de usuarios

Tabla con: código de usuario, usuario, nombre, fecha de creación (DD/MM/YYYY HH:MM).
Acciones: edición, eliminación, detalle.

## 7.3 Detalle de usuario

```
Usuario
Nombre
Número de teléfono
Foto de perfil
Lista de perfiles relacionados al usuario
```

## 7.4 Edición y eliminación

Mismos criterios que en productos: edición de campos permitidos, eliminación con confirmación previa del usuario.

---

# 8. Perfiles de usuario

## 8.1 Alta / consulta

Tabla con: código de perfil, nombre, fecha de creación (DD/MM/YYYY HH:MM).
Acciones: edición, eliminación, detalle (modal).

## 8.2 Detalle de perfil (modal)

```
Código de perfil
Nombre de perfil
Fecha de creación de perfil
Lista de secciones relacionadas al perfil
```

Las "secciones" representan las pantallas/módulos del sistema (Productos, Usuarios, Perfiles, etc.) a las que el perfil da acceso.

---

# 9. Autenticación

## 9.1 Login / Logout

Autenticación contra la colección `users` de MongoDB, verificando la contraseña cifrada.

## 9.2 Recuperación de contraseña

Flujo:
1. El usuario solicita recuperación indicando su correo (usuario).
2. El backend valida que el usuario exista en la base de datos.
3. Si existe, se envían las credenciales/instrucciones al correo registrado.
4. Si no existe, se responde sin revelar si el correo está o no registrado (buena práctica de seguridad).

---

# 10. Control de accesos

Cada usuario puede tener uno o varios perfiles de autorización (`AccessProfile`), y cada perfil define la lista de secciones (`Section`) a las que da acceso.

Flujo de autorización (middleware `CheckSectionPermission`, usado como `section:SEC-PRODUCTS`, `section:SEC-USERS`, `section:SEC-PROFILES`):

```
Request → ¿usuario autenticado? (401 si no)
        → ¿tiene perfiles asignados? (403 si no)
        → ¿la sección solicitada existe? (403 si no)
        → ¿alguno de sus perfiles incluye esa sección? (403 si no)
        → autorizado → continúa al controlador
```

- **Backend:** middleware `App\Http\Middleware\CheckSectionPermission.php`, aplicado por grupo de rutas en `routes/api.php`.
- **Frontend:** Angular Guards (`auth.guard.ts`, `section.guard.ts`) que restringen la navegación a las rutas no autorizadas y ocultan del menú las secciones sin acceso.

---

# 11. Seguridad

- Las contraseñas se almacenan cifradas (hash), nunca en texto plano.
- Validaciones de formularios duplicadas en frontend (experiencia de usuario) y backend (autoridad final).
- No se expone información sensible en las respuestas de la API (por ejemplo, el hash de la contraseña nunca se retorna en `GET /api/users`).
- Variables sensibles (credenciales de MongoDB, claves de correo, tokens) se mantienen en `backend/.env`, fuera del control de versiones.

---

# 12. Bitácora

Cada operación de creación, edición o eliminación sobre `products`, `users` y `profiles` genera un registro en la colección `audit_logs` con:

```
entidad         (products | users | profiles)
entidad_id
acción           (create | update | delete)
valores_anteriores
valores_actuales
usuario_responsable
fecha
```

Esto permite comparar el estado anterior de un registro contra el estado actual ante cualquier cambio.

La consulta de bitácora está disponible vía API (`GET /api/audit-logs`, con filtros opcionales por entidad y rango de fechas).

---

# 13. API REST

Todas las rutas, salvo las de autenticación pública, requieren el header:

```
Authorization: Bearer {token}
```

y además están protegidas por el middleware `section:{CODIGO_SECCION}`,
que valida que el perfil de autorización del usuario incluya esa sección
(ver punto 10, Control de accesos).

## 13.1 Autenticación (públicas, sin token)
```
POST   /api/login
POST   /api/forgot-password
POST   /api/reset-password
```

## 13.2 Sesión (requieren token, sin sección específica)
```
GET    /api/me       — usuario autenticado + perfiles + secciones permitidas
POST   /api/logout
```

## 13.3 Productos — sección `SEC-PRODUCTS`
```
GET    /api/products
POST   /api/products
GET    /api/products/{product}
PUT    /api/products/{product}
PATCH  /api/products/{product}
DELETE /api/products/{product}
```

## 13.4 Usuarios — sección `SEC-USERS`
```
GET    /api/users
POST   /api/users            (multipart/form-data: name, email, phone, password, profile_photo, profile_ids[])
GET    /api/users/{user}
PUT    /api/users/{user}
PATCH  /api/users/{user}
DELETE /api/users/{user}
```

## 13.5 Perfiles de autorización (AccessProfile) — sección `SEC-PROFILES`
```
GET    /api/access-profiles
POST   /api/access-profiles  (name, description, section_ids[])
GET    /api/access-profiles/{access_profile}
PUT    /api/access-profiles/{access_profile}
PATCH  /api/access-profiles/{access_profile}
DELETE /api/access-profiles/{access_profile}
```

## 13.6 Secciones — sección `SEC-PROFILES`
```
GET    /api/sections
POST   /api/sections
GET    /api/sections/{section}
PUT    /api/sections/{section}
PATCH  /api/sections/{section}
DELETE /api/sections/{section}
```

## 13.7 Perfil personal del usuario (Profile) — requiere solo autenticación
```
GET    /api/profile
PUT    /api/profile
DELETE /api/profile
```

> Nota importante: en este proyecto **"Profile"** y **"AccessProfile"** son
> conceptos distintos. `Profile` es la información personal del usuario
> autenticado; `AccessProfile` es el perfil de permisos que agrupa las
> secciones a las que un usuario tiene acceso (lo que el examen llama
> "Perfiles de Usuarios").

## 13.8 Bitácora — solo lectura
```
GET    /api/audit-logs
GET    /api/audit-logs?entity=products
GET    /api/audit-logs?entity=users&from=2026-08-01&to=2026-08-25
```

---

# 14. Documentación de API (Postman)

La colección de Postman (carpeta `postman/`) incluye ejemplos de petición y respuesta para los cinco grupos de endpoints anteriores (productos, usuarios, perfiles, autenticación y bitácora), incluyendo casos de error (404, 422) y el flujo completo de login → uso de token → logout.

---

# 15. Pruebas automatizadas

## Frontend (Jasmine/Karma)
```
npm test
```
Cobertura: componentes de productos, usuarios, perfiles y autenticación.

## Backend (PHPUnit)
```
php artisan test
```
Cobertura: CRUD de productos, usuarios, perfiles, autenticación y generación de bitácora.

---

# 16. Ejecución del proyecto

## Backend
```
cd C:\proyectos\tap-terminal\backend
composer install
php artisan serve --host=127.0.0.1 --port=8080
```
API: `http://127.0.0.1:8080/api`

## Frontend
```
cd C:\proyectos\tap-terminal\frontend
npm install
npm start
```
Frontend: `http://localhost:4200`

---

# 17. Estructura general del proyecto

```
tap-terminal/
│
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── ProductController.php
│   │   │   ├── UserController.php
│   │   │   ├── ProfileController.php
│   │   │   ├── AuthController.php
│   │   │   └── AuditLogController.php
│   │   └── Models/
│   │       ├── Product.php
│   │       ├── User.php
│   │       ├── Profile.php
│   │       └── AuditLog.php
│   ├── routes/api.php
│   ├── tests/
│   └── .env
│
├── frontend/
│   └── src/app/
│       ├── models/
│       ├── services/
│       ├── guards/
│       └── pages/
│           ├── products/
│           ├── users/
│           ├── profiles/
│           └── auth/
│
├── postman/
├── .github/workflows/
└── README.md
```

---

# 18. Variables de entorno

No deben publicarse en el repositorio: contraseñas, tokens, API keys, credenciales de MongoDB ni claves de correo (usadas para la recuperación de contraseña). Usar `.env.example` sin credenciales reales para compartir configuración.

---

# 19. Estado final

```
=========================================
             TAP TERMINAL
=========================================

Productos:        READY
Usuarios:         READY
Perfiles:         READY
Autenticación:    READY
Control accesos:  READY
Seguridad:        READY
Bitácora:         READY
Documentación API: READY (Postman)

Frontend Tests:   READY
Backend Tests:    READY
Build:            READY

=========================================
              STATUS: READY
=========================================
```

---

# 20. Autor

**Ing. Jose Manuel Lorenzo Martinez**

Proyecto presentado como parte del proceso de evaluación técnica / examen de admisión — Área de Desarrollo, Grupo TAP Terminal.
