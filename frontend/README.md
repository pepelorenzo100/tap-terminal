# TAP Terminal

Sistema web de administración desarrollado como prueba técnica.

TAP Terminal permite administrar productos, usuarios y perfiles de autorización mediante una aplicación web con control de acceso por secciones.

---

# 1. Descripción general

TAP Terminal está compuesto por dos aplicaciones principales:

- **Frontend:** Angular 19
- **Backend:** Laravel 11
- **Base de datos:** MongoDB
- **Autenticación:** Laravel Sanctum
- **Comunicación:** API REST mediante HTTP/JSON

La arquitectura general es:

```text
                    USUARIO
                       |
                       v
              +----------------+
              |    Angular     |
              |   Frontend     |
              | localhost:4200 |
              +----------------+
                       |
                       | HTTP / JSON
                       v
              +----------------+
              |    Laravel     |
              |    Backend     |
              |  127.0.0.1:8000|
              +----------------+
                       |
                       v
              +----------------+
              |    MongoDB     |
              | tap_terminal   |
              +----------------+