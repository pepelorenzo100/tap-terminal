# TAP Terminal

## Sistema de Administración de Productos

Aplicación web desarrollada para la administración de productos mediante una arquitectura separada de frontend y backend.

El proyecto implementa un CRUD completo utilizando Angular, Laravel, PHP y MongoDB.

---

# 1. Información del proyecto

**Proyecto:** TAP Terminal  
**Módulo:** Product Management  
**Autor:** Ing. Jose Manuel Lorenzo Martinez  
**Presentación:** Evaluación técnica / examen  

---

# 2. Descripción

TAP Terminal es una aplicación web para la administración de productos.

El sistema permite realizar las operaciones principales de un CRUD:

- Crear productos.
- Consultar productos.
- Visualizar el detalle de productos.
- Editar productos.
- Eliminar productos.
- Validar información.
- Mostrar mensajes al usuario.
- Generar códigos de producto automáticamente.
- Exportar productos a Excel.
- Exportar productos a PDF.

La aplicación está dividida en:

- **Frontend:** Angular + TypeScript.
- **Backend:** Laravel + PHP.
- **Base de datos:** MongoDB.

---

# 3. Arquitectura

La comunicación principal del sistema sigue el siguiente flujo:

```text
┌──────────────────────────────┐
│           ANGULAR            │
│           FRONTEND           │
└──────────────┬───────────────┘
               │
               │ HTTP / JSON
               ▼
┌──────────────────────────────┐
│       PRODUCT SERVICE        │
│       Angular HttpClient     │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│           LARAVEL            │
│            API               │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      PRODUCT CONTROLLER      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        PRODUCT MODEL         │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          MONGODB             │
│          products            │
└──────────────────────────────┘
```

---

# 4. Tecnologías utilizadas

## Frontend

- Angular
- TypeScript
- HTML
- CSS
- Angular Forms
- Angular HttpClient
- Jasmine
- Karma
- SheetJS / XLSX
- jsPDF
- jspdf-autotable

## Backend

- PHP
- Laravel
- Laravel REST API
- PHPUnit

## Base de datos

- MongoDB

## Herramientas de desarrollo

- Visual Studio Code
- PowerShell
- Google Chrome
- npm
- Composer

## Sistema operativo

- Windows

---

# 5. Funcionalidades

El módulo de productos implementa:

```text
CREATE
READ
UPDATE
DELETE
```

Además:

```text
VALIDACIONES
VISUALIZACIÓN DE DETALLE
MENSAJES DE SISTEMA
GENERACIÓN AUTOMÁTICA DE CÓDIGOS
EXPORTACIÓN A EXCEL
EXPORTACIÓN A PDF
```

---

# 6. CRUD de productos

## 6.1 Crear

Permite registrar un producto utilizando:

```text
Nombre
Marca
Precio
```

El código del producto no se introduce manualmente.

El backend genera automáticamente el código.

---

## 6.2 Consultar

La aplicación consulta los productos mediante:

```http
GET /api/products
```

---

## 6.3 Visualizar

El usuario puede seleccionar un producto para consultar sus detalles.

---

## 6.4 Editar

Permite modificar:

```text
Nombre
Marca
Precio
```

El código del producto permanece sin modificación.

---

## 6.5 Eliminar

Permite eliminar un producto después de solicitar confirmación al usuario.

---

# 7. Validaciones

## 7.1 Validaciones del Frontend

Angular valida la información antes de enviarla al backend.

### Nombre

El nombre es obligatorio.

### Marca

La marca es obligatoria.

### Precio

El precio debe:

- Ser numérico.
- Ser mayor o igual a `0`.
- Ser menor o igual a `999.99`.

---

## 7.2 Validaciones del Backend

Laravel vuelve a validar la información recibida.

### name

```text
required
string
max:100
```

### brand

```text
required
string
max:100
```

### price

```text
required
numeric
min:0
max:999.99
```

La validación del backend es necesaria aunque el frontend también valide los datos.

Nunca se debe confiar únicamente en las validaciones realizadas por el cliente.

---

# 8. API REST

La API principal utiliza:

```text
/api/products
```

---

## 8.1 Obtener todos los productos

```http
GET /api/products
```

Obtiene todos los productos disponibles.

---

## 8.2 Crear producto

```http
POST /api/products
```

Ejemplo:

```json
{
    "name": "Producto de prueba",
    "brand": "TAP Terminal",
    "price": 350
}
```

El frontend únicamente envía:

```text
name
brand
price
```

El backend administra:

```text
id
code
created_at
updated_at
```

La creación correcta devuelve:

```text
HTTP 201 Created
```

---

## 8.3 Obtener un producto

```http
GET /api/products/{id}
```

Obtiene un producto mediante su identificador.

Si el producto no existe:

```text
HTTP 404 Not Found
```

---

## 8.4 Actualizar producto

```http
PUT /api/products/{id}
```

También se permite:

```http
PATCH /api/products/{id}
```

Los campos modificables son:

```text
name
brand
price
```

El campo:

```text
code
```

no puede modificarse mediante el flujo normal de actualización.

---

## 8.5 Eliminar producto

```http
DELETE /api/products/{id}
```

El backend elimina el producto correspondiente de MongoDB.

---

# 9. Rutas Laravel

Las rutas principales verificadas mediante:

```powershell
php artisan route:list
```

son:

```text
GET|HEAD     api/products
POST         api/products
GET|HEAD     api/products/{product}
PUT|PATCH    api/products/{product}
DELETE       api/products/{product}
```

Estas rutas corresponden al controlador:

```text
App\Http\Controllers\Api\ProductController
```

---

# 10. ProductController

Archivo:

```text
backend/app/Http/Controllers/Api/ProductController.php
```

Responsabilidades:

- Obtener productos.
- Crear productos.
- Obtener un producto específico.
- Actualizar productos.
- Eliminar productos.
- Validar solicitudes.
- Generar respuestas JSON.

Métodos principales:

```text
index()
store()
show()
update()
destroy()
```

---

# 11. Product Model

Archivo:

```text
backend/app/Models/Product.php
```

El modelo representa los productos almacenados en MongoDB.

Colección:

```text
products
```

---

## 11.1 Campos asignables

Los campos permitidos son:

```text
name
brand
price
```

El modelo utiliza:

```php
protected $fillable = [
    'name',
    'brand',
    'price',
];
```

El campo:

```text
code
```

no forma parte de `$fillable`.

Esto evita que el código sea enviado libremente mediante asignación masiva desde el frontend.

---

# 12. Generación automática del código

El backend genera automáticamente el código del producto.

La generación se realiza mediante el evento:

```text
creating
```

del modelo `Product`.

El código utiliza un ULID.

Formato:

```text
PROD-XXXXXXXXXXXXXXXXXXXXXXXXXX
```

Ejemplo:

```text
PROD-01M0JQ510K901CYY1CC6PR17MF
```

El código es responsabilidad del backend.

El frontend no necesita generarlo.

---

# 13. Timestamps

Laravel administra automáticamente:

```text
created_at
updated_at
```

Al crear un producto se registran:

```text
created_at
updated_at
```

Al actualizar un producto se actualiza:

```text
updated_at
```

---

# 14. Precio

El modelo utiliza:

```php
protected $casts = [
    'price' => 'decimal:2',
];
```

Esto permite manejar el precio con dos posiciones decimales.

Ejemplos:

```text
250.00
250.50
999.99
```

El uso de una representación decimal es apropiado para valores monetarios.

---

# 15. Frontend

El módulo principal de productos se implementa mediante Angular.

Componente principal:

```text
frontend/src/app/pages/products/products.component.ts
```

Responsabilidades:

- Cargar productos.
- Crear productos.
- Editar productos.
- Visualizar productos.
- Eliminar productos.
- Validar información.
- Mostrar mensajes.
- Exportar Excel.
- Exportar PDF.

---

# 16. ProductService

El componente Angular utiliza:

```text
ProductService
```

para comunicarse con Laravel.

El flujo es:

```text
ProductsComponent
        ↓
ProductService
        ↓
HttpClient
        ↓
REST API
        ↓
Laravel
```

Esto mantiene separada la lógica de presentación de la comunicación con el backend.

---

# 17. Exportación a Excel

El sistema permite exportar los productos a Excel.

La funcionalidad utiliza:

```text
XLSX / SheetJS
```

Archivo generado:

```text
productos-tap-terminal.xlsx
```

La información exportada incluye:

```text
Código
Nombre
Marca
Precio
Fecha de creación
```

La exportación se realiza directamente desde Angular.

---

# 18. Exportación a PDF

El sistema permite generar un PDF con el listado de productos.

Librerías utilizadas:

```text
jsPDF
jspdf-autotable
```

Archivo generado:

```text
productos-tap-terminal.pdf
```

El PDF incluye:

```text
TAP Terminal
Listado de productos
Fecha de generación
Código
Nombre
Marca
Precio
Fecha de creación
```

---

# 19. Pruebas automatizadas del Frontend

El frontend utiliza:

```text
Jasmine
Karma
```

Las pruebas se ejecutan mediante:

```powershell
npm test
```

Durante la validación del proyecto se obtuvo:

```text
Executed 25 of 25 SUCCESS

TOTAL: 25 SUCCESS
```

Esto confirma que las 25 pruebas ejecutadas por Karma finalizaron correctamente.

Durante la ejecución de Karma puede aparecer posteriormente un mensaje de desconexión del navegador al finalizar el proceso:

```text
Disconnected Client disconnected from CONNECTED state
```

Este mensaje apareció después de:

```text
25 SUCCESS
```

por lo que no cambia el resultado de las pruebas ejecutadas.

---

# 20. Pruebas automatizadas del Backend

El backend utiliza Laravel/PHPUnit.

Ejecutar:

```powershell
php artisan test
```

Durante la validación realizada para el proyecto se obtuvo:

```text
8 passed
32 assertions
```

Las pruebas verifican diferentes comportamientos del backend y del módulo de productos, incluyendo operaciones CRUD y validaciones.

---

# 21. Compilación del Frontend

Para generar el build:

```powershell
npm run build
```

Durante la validación se obtuvo:

```text
Application bundle generation complete.
```

La salida se genera en:

```text
frontend/dist/frontend
```

La compilación del frontend fue completada correctamente.

---

# 22. Ejecución del Backend

Entrar a:

```powershell
cd C:\proyectos\tap-terminal\backend
```

Ejecutar:

```powershell
php artisan serve --host=127.0.0.1 --port=8080
```

Backend:

```text
http://127.0.0.1:8080
```

API:

```text
http://127.0.0.1:8080/api
```

---

# 23. Ejecución del Frontend

Abrir otra terminal.

Entrar a:

```powershell
cd C:\proyectos\tap-terminal\frontend
```

Instalar dependencias:

```powershell
npm install
```

Ejecutar:

```powershell
npm start
```

o:

```powershell
ng serve
```

Frontend:

```text
http://localhost:4200
```

---

# 24. Puerto 4200

Si aparece:

```text
Port 4200 is already in use.
```

significa que otro proceso está utilizando ese puerto.

Puede verificarse mediante:

```powershell
netstat -ano | findstr :4200
```

Si ya existe una instancia de Angular funcionando correctamente en:

```text
http://localhost:4200
```

no es necesario iniciar otra instancia.

---

# 25. Verificación de la API

El backend debe estar ejecutándose antes de probar la comunicación desde Angular.

Backend:

```text
http://127.0.0.1:8080
```

Endpoint:

```text
http://127.0.0.1:8080/api/products
```

Durante la validación se verificó:

```text
GET /api/products
```

con respuesta:

```text
HTTP 200 OK
```

Esto confirma la comunicación entre Angular y el endpoint de productos durante la prueba de integración.

---

# 26. Flujo completo del CRUD

## CREATE

```text
Usuario
   ↓
Formulario Angular
   ↓
ProductsComponent
   ↓
ProductService
   ↓
POST /api/products
   ↓
ProductController
   ↓
Product Model
   ↓
MongoDB
```

---

## READ

```text
Usuario
   ↓
Angular
   ↓
ProductService
   ↓
GET /api/products
   ↓
Laravel
   ↓
MongoDB
   ↓
Angular
```

---

## UPDATE

```text
Usuario
   ↓
Editar producto
   ↓
ProductsComponent
   ↓
ProductService
   ↓
PUT /api/products/{id}
   ↓
Laravel
   ↓
MongoDB
   ↓
Angular
```

---

## DELETE

```text
Usuario
   ↓
Eliminar
   ↓
Confirmación
   ↓
ProductService
   ↓
DELETE /api/products/{id}
   ↓
Laravel
   ↓
MongoDB
   ↓
Angular actualiza la lista
```

---

# 27. Estructura general del proyecto

```text
tap-terminal/
│
├── backend/
│   │
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── Api/
│   │   │           └── ProductController.php
│   │   │
│   │   └── Models/
│   │       └── Product.php
│   │
│   ├── routes/
│   │   └── api.php
│   │
│   ├── tests/
│   │   ├── Feature/
│   │   └── Unit/
│   │
│   ├── artisan
│   ├── composer.json
│   └── .env
│
├── frontend/
│   │
│   ├── src/
│   │   └── app/
│   │       ├── models/
│   │       │   └── product.ts
│   │       │
│   │       ├── services/
│   │       │   └── product.service.ts
│   │       │
│   │       └── pages/
│   │           └── products/
│   │               ├── products.component.ts
│   │               ├── products.component.html
│   │               ├── products.component.css
│   │               └── products.component.spec.ts
│   │
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   └── tsconfig.spec.json
│
└── README.md
```

---

# 28. Requisitos del proyecto

Para trabajar con el proyecto se requiere:

```text
Windows
PHP
Composer
Node.js
npm
Angular CLI
MongoDB
Visual Studio Code
Google Chrome
```

Las versiones instaladas pueden consultarse mediante:

```powershell
php --version
composer --version
node --version
npm --version
ng version
```

---

# 29. Instalación inicial

## Backend

Entrar al backend:

```powershell
cd C:\proyectos\tap-terminal\backend
```

Instalar dependencias:

```powershell
composer install
```

Configurar el archivo:

```text
backend/.env
```

Después iniciar Laravel:

```powershell
php artisan serve --host=127.0.0.1 --port=8080
```

---

## Frontend

Abrir otra terminal:

```powershell
cd C:\proyectos\tap-terminal\frontend
```

Instalar dependencias:

```powershell
npm install
```

Iniciar Angular:

```powershell
npm start
```

---

# 30. Variables de entorno

La configuración sensible debe mantenerse en:

```text
backend/.env
```

No deben publicarse:

```text
Contraseñas
Tokens
API Keys
Credenciales de MongoDB
Secretos
Claves privadas
```

Para compartir el proyecto se recomienda utilizar:

```text
.env.example
```

sin credenciales reales.

---

# 31. Comandos principales

## Backend

```powershell
cd C:\proyectos\tap-terminal\backend
```

```powershell
php artisan serve --host=127.0.0.1 --port=8080
```

```powershell
php artisan test
```

```powershell
php artisan route:list
```

```powershell
php artisan
```

---

## Frontend

```powershell
cd C:\proyectos\tap-terminal\frontend
```

```powershell
npm install
```

```powershell
npm start
```

```powershell
npm test
```

```powershell
npm run build
```

---

# 32. Validación funcional

Durante la evaluación del proyecto se verificaron directamente desde la interfaz las operaciones:

```text
Crear       ✅
Consultar   ✅
Visualizar  ✅
Editar      ✅
Eliminar    ✅
```

También se verificaron:

```text
Validaciones          ✅
Exportación Excel     ✅
Exportación PDF       ✅
Comunicación API      ✅
```

---

# 33. Validación técnica

Estado de los principales componentes:

| Elemento | Estado |
|---|---|
| Angular | ✅ |
| TypeScript | ✅ |
| Laravel | ✅ |
| PHP | ✅ |
| MongoDB | ✅ |
| API REST | ✅ |
| CRUD | ✅ |
| Crear producto | ✅ |
| Consultar productos | ✅ |
| Visualizar producto | ✅ |
| Editar producto | ✅ |
| Eliminar producto | ✅ |
| Validaciones | ✅ |
| Generación de código | ✅ |
| Exportación Excel | ✅ |
| Exportación PDF | ✅ |
| Pruebas Frontend | ✅ 25/25 |
| Pruebas Backend | ✅ 8 passed / 32 assertions |
| Angular Build | ✅ |
| Rutas Laravel | ✅ |
| Comunicación Angular → Laravel | ✅ |
| Problems en VS Code | ✅ 0 |

---

# 34. Mantenimiento

Antes de modificar una funcionalidad existente:

1. Identificar el componente Angular.
2. Revisar el servicio correspondiente.
3. Revisar el endpoint.
4. Revisar el controlador Laravel.
5. Revisar el modelo.
6. Revisar las pruebas existentes.
7. Realizar el cambio.
8. Ejecutar las pruebas.
9. Ejecutar el build.
10. Probar nuevamente la funcionalidad desde la interfaz.

Después de cambios importantes:

### Frontend

```powershell
npm test
```

```powershell
npm run build
```

### Backend

```powershell
php artisan test
```

### Rutas

```powershell
php artisan route:list
```

---

# 35. Buenas prácticas

El proyecto mantiene una separación de responsabilidades:

```text
Component
    ↓
Service
    ↓
API
    ↓
Controller
    ↓
Model
    ↓
Database
```

El frontend se encarga principalmente de:

- Interfaz.
- Interacción con el usuario.
- Validaciones de experiencia de usuario.
- Consumo de API.
- Presentación de información.
- Exportaciones.

El backend se encarga principalmente de:

- Validación de datos.
- Reglas de negocio.
- Operaciones CRUD.
- Generación del código.
- Comunicación con MongoDB.
- Respuestas HTTP.

---

# 36. Seguridad

No almacenar en el repositorio:

- Contraseñas.
- Tokens.
- API Keys.
- Credenciales de MongoDB.
- Secretos.
- Claves privadas.

El archivo `.env` debe permanecer fuera del repositorio cuando contenga información sensible.

Para compartir la configuración se debe utilizar:

```text
.env.example
```

sin credenciales reales.

---

# 37. Estado final

```text
=========================================
             TAP TERMINAL
       PRODUCT MANAGEMENT SYSTEM
=========================================

Frontend:        READY
Backend:         READY
Database:        READY
REST API:        READY
CRUD:            READY
Validation:      READY
Excel Export:    READY
PDF Export:      READY

Frontend Tests:  25/25 SUCCESS
Backend Tests:   8 PASSED
Assertions:      32
Build:           SUCCESS
API:             SUCCESS
CRUD UI:         VERIFIED
Problems:        0

=========================================
              STATUS: READY
=========================================
```

---

# 38. Autor

**Ing. Jose Manuel Lorenzo Martinez**

Autor y desarrollador del proyecto:

```text
TAP Terminal
```

Módulo presentado:

```text
Product Management
```

El proyecto es presentado por el:

**Ing. Jose Manuel Lorenzo Martinez**

como parte de un proceso de evaluación técnica / examen.

---

# 39. Licencia

Proyecto desarrollado para fines de evaluación, demostración y desarrollo profesional.

La distribución y uso del proyecto deberán realizarse de acuerdo con las condiciones establecidas por el propietario del proyecto.

---

# 40. Resumen final

TAP Terminal implementa una arquitectura web separada por responsabilidades:

```text
Angular
Frontend y experiencia de usuario
        ↓
ProductService
Comunicación HTTP
        ↓
Laravel API
Reglas y operaciones del backend
        ↓
ProductController
Administración de solicitudes
        ↓
Product Model
Representación de datos
        ↓
MongoDB
Persistencia
```

El módulo de productos cuenta con:

```text
CRUD completo
Validaciones
Generación automática de códigos
API REST
Persistencia MongoDB
Pruebas automatizadas
Exportación Excel
Exportación PDF
Documentación
```

El proyecto fue validado funcional y técnicamente durante la evaluación.

```text
=========================================
             TAP TERMINAL
=========================================

        Ing. Jose Manuel Lorenzo Martinez

              STATUS: READY
=========================================
```