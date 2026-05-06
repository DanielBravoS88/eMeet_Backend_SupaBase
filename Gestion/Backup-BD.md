# Respaldo de Base de Datos — eMeet

## Plataforma

- **Proveedor:** Supabase
- **Motor:** PostgreSQL

---

## Método de respaldo manual (Supabase Dashboard)

1. Acceder a [https://supabase.com](https://supabase.com) e iniciar sesión.
2. Seleccionar el proyecto `eMeet`.
3. Ir a **Settings → Database**.
4. Seleccionar **Backups** (disponible en plan Pro) o usar la opción **pg_dump**.

---

## Exportar esquema y datos con `pg_dump`

```bash
pg_dump \
  --host=<SUPABASE_HOST> \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --schema=public \
  --file=backup_emeet_$(date +%Y%m%d).sql
```

> Reemplazar `<SUPABASE_HOST>` con el host del proyecto Supabase (disponible en Settings → Database → Connection string).

---

## Scripts de esquema y datos del proyecto

Los scripts SQL que definen el esquema completo y los datos de prueba están disponibles en:

- **Esquema:** `supabase/001_emeet_schema.sql` y migraciones sucesivas (`002_*.sql` … `008_*.sql`)
- **Datos de prueba:** `Producto/Base-de-Datos/Datos-Prueba.sql`
- **Procedimientos:** `Producto/Base-de-Datos/Procedimientos-Almacenados.sql`

---

## Restaurar en ambiente de pruebas

1. Crear un proyecto nuevo en Supabase (ej. `emeet-dev`).
2. Abrir **SQL Editor** en el nuevo proyecto.
3. Ejecutar en orden los scripts de `supabase/`:
   ```
   001_emeet_schema.sql
   002_locatario_events.sql
   003_realtime_identity.sql
   004_fix_policies.sql
   005_reports.sql
   006_transactions_and_event_status.sql
   007_cleanup_event_payment_fields.sql
   008_profiles_role_business_fields.sql
   ```
4. Opcionalmente, ejecutar `Producto/Base-de-Datos/Datos-Prueba.sql` para cargar datos de ejemplo.

---

## Frecuencia de respaldo recomendada

| Ambiente    | Frecuencia sugerida    |
|-------------|------------------------|
| Producción  | Diaria (automática en Supabase Pro) |
| Desarrollo  | Antes de cada migración mayor |

---

## Observación

Supabase en plan gratuito ofrece respaldos automáticos limitados. Para proyectos en producción se recomienda activar el plan Pro o exportar manualmente el esquema con regularidad.
