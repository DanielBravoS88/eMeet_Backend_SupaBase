# Respaldo de base de datos

## Base de datos del proyecto
| Parámetro | Valor |
|-----------|-------|
| Plataforma | Supabase |
| Motor | PostgreSQL |
| Proyecto | eMeet (producción) |

---

## Procedimiento de respaldo manual (Supabase Dashboard)

1. Acceder al Dashboard de Supabase: https://app.supabase.com
2. Seleccionar el proyecto de producción.
3. Ir a **Settings → Database**.
4. En la sección **Backups**, verificar los respaldos automáticos disponibles.
5. Para exportar manualmente: ir a **SQL Editor** y ejecutar los dumps necesarios, o usar la opción de exportación.

---

## Procedimiento de respaldo con `pg_dump` (línea de comandos)

```bash
# Variables de entorno necesarias
export PGPASSWORD=<tu-db-password>
export DB_HOST=<supabase-db-host>
export DB_NAME=postgres
export DB_USER=postgres

# Crear respaldo completo
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -f backup_$(date +%Y%m%d_%H%M%S).dump

# Crear respaldo solo de estructura (sin datos)
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME --schema-only -f schema_$(date +%Y%m%d_%H%M%S).sql

# Crear respaldo solo de datos
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME --data-only -f data_$(date +%Y%m%d_%H%M%S).sql
```

---

## Restauración en ambiente de pruebas

```bash
# Restaurar en proyecto de staging/pruebas
export PGPASSWORD=<staging-db-password>
export STAGING_HOST=<staging-db-host>

pg_restore -h $STAGING_HOST -U postgres -d postgres -F c backup_YYYYMMDD_HHMMSS.dump
```

---

## Script SQL de la estructura actual
La estructura de la base de datos se encuentra documentada en:
- `supabase/001_emeet_schema.sql` — esquema inicial con tablas, políticas RLS y configuración de Realtime.
- `prisma/schema.prisma` — modelo de datos con Prisma ORM.

---

## Respaldo automático en Supabase
Supabase Pro ofrece respaldos automáticos diarios con retención de 7 días. Para el plan gratuito:
- Se recomienda realizar respaldos manuales semanalmente.
- Guardar los archivos `.dump` o `.sql` en un almacenamiento seguro (Google Drive, S3, etc.).

---

## Recomendaciones
- Identificar cada respaldo con fecha, ambiente y responsable: `backup_YYYYMMDD_prod_<autor>.dump`
- Antes de cualquier migración mayor, generar un respaldo.
- Verificar la integridad del respaldo restaurándolo en el ambiente de pruebas.
