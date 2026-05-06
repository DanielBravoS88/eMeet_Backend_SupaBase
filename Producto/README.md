# Producto — eMeet Backend

Esta carpeta contiene los artefactos del producto técnico: scripts de base de datos y referencia de la API.

## Estructura

```
Producto/
├── API/
│   └── README.md              # Referencia completa de endpoints de la API
└── Base-de-Datos/
    ├── Script-BD.sql           # Script completo de creación del esquema
    ├── Datos-Prueba.sql        # Datos de prueba para desarrollo y staging
    ├── Procedimientos-Almacenados.sql  # Funciones PL/pgSQL
    └── README.md               # Descripción de los artefactos de BD
```

## Repositorios relacionados

- **Backend (este repo):** https://github.com/DanielBravoS88/eMeet_Backend_SupaBase
- **Frontend:** https://github.com/DanielBravoS88/eMeet_frontend

## Despliegues en producción

| Componente     | Plataforma  | URL                                          |
|----------------|-------------|----------------------------------------------|
| API REST       | Render      | *(URL de Render)*                            |
| Frontend       | Vercel      | https://e-meet-frontend-nine.vercel.app/     |
| Base de datos  | Supabase    | PostgreSQL gestionado                        |
