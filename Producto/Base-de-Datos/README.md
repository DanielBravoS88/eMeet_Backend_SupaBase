# Base de Datos — eMeet

## Descripción

Esta carpeta contiene los artefactos SQL del proyecto eMeet:

| Archivo                            | Descripción                                                   |
|------------------------------------|---------------------------------------------------------------|
| [Script-BD.sql](./Script-BD.sql)   | Script completo de creación del esquema de la base de datos   |
| [Datos-Prueba.sql](./Datos-Prueba.sql) | Datos de ejemplo para desarrollo y ambiente de pruebas   |
| [Procedimientos-Almacenados.sql](./Procedimientos-Almacenados.sql) | Funciones y procedimientos PL/pgSQL |

## Migraciones incrementales

Las migraciones históricas del esquema se encuentran en `supabase/` en la raíz del repositorio:

```
supabase/
├── 001_emeet_schema.sql                    # Esquema base
├── 002_locatario_events.sql                # Eventos de locatarios
├── 003_realtime_identity.sql               # Realtime
├── 004_fix_policies.sql                    # Políticas RLS
├── 005_reports.sql                         # Módulo de reportes
├── 006_transactions_and_event_status.sql   # Transacciones
├── 007_cleanup_event_payment_fields.sql    # Limpieza de campos
└── 008_profiles_role_business_fields.sql   # Roles y campos de negocio
```

## Cómo aplicar el esquema

1. Ingresar a [Supabase Dashboard](https://supabase.com) → SQL Editor.
2. Ejecutar `Script-BD.sql` o los archivos de `supabase/` en orden numérico.
3. Para cargar datos de prueba, ejecutar `Datos-Prueba.sql`.

## Plataforma

- **Motor:** PostgreSQL (Supabase)
- **ORM:** Prisma (ver `prisma/schema.prisma`)
- **Seguridad:** Row Level Security (RLS) habilitado en todas las tablas
