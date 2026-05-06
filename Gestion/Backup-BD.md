# Backup de Base de Datos — eMeet

## Procedimiento de respaldo (pg_dump)

```bash
# Exportar esquema completo desde producción
pg_dump \
  --schema-only \
  --no-owner \
  --no-acl \
  -f backup_schema_$(date +%Y%m%d).sql \
  "$DATABASE_URL"

# Exportar datos (sin datos sensibles de auth)
pg_dump \
  --data-only \
  --exclude-table=auth.* \
  -f backup_data_$(date +%Y%m%d).sql \
  "$DATABASE_URL"
```

## Orden de ejecución de migraciones

1. `Producto/Base-de-Datos/Script-BD.sql` — esquema base, tablas, índices, RLS, trigger, Realtime y Storage
2. `Producto/Base-de-Datos/Procedimientos-Almacenados.sql` — funciones PL/pgSQL
3. `Producto/Base-de-Datos/Datos-Prueba.sql` — seed data para ambiente de pruebas

## Restauración en ambiente de pruebas

```bash
psql "$TEST_DATABASE_URL" < Script-BD.sql
psql "$TEST_DATABASE_URL" < Procedimientos-Almacenados.sql
psql "$TEST_DATABASE_URL" < Datos-Prueba.sql
```

## Notas

- Nunca ejecutar `Datos-Prueba.sql` en producción.
- Los backups de producción deben guardarse en almacenamiento cifrado.
- Supabase provee backups automáticos diarios en planes pagos.
