# Backup de Base de Datos — Proyecto eMeet

> Este documento describe el procedimiento de respaldo de la base de datos del proyecto eMeet, que utiliza **Supabase PostgreSQL** como sistema de base de datos.
>
> **Proyecto Supabase**: https://supabase.com/dashboard/project/ksghpwonmnxmbhmfpaog

---

## 1. Objetivo del Backup

Garantizar la disponibilidad, integridad y recuperabilidad de los datos del sistema eMeet ante pérdidas accidentales, fallos de infraestructura, errores de desarrollo o situaciones de emergencia. También se busca cumplir con los requisitos académicos de evidenciar el manejo responsable de los datos del proyecto.

---

## 2. Frecuencia Recomendada

| Tipo de backup | Frecuencia | Responsable sugerido |
|---|---|---|
| Backup automático de Supabase | Diario (plan Pro) | Supabase (automático) |
| Backup manual (exportación) | Antes de cambios críticos en el esquema | Desarrollador responsable |
| Backup para entrega académica | Al menos una vez antes de la entrega | Equipo eMeet |

> ⚠️ El plan gratuito de Supabase no incluye backups automáticos con restauración. Para la entrega académica, se recomienda hacer al menos un backup manual antes de presentar el proyecto.

---

## 3. Pasos para Exportar el Respaldo desde Supabase

### Opción A — Desde el Dashboard de Supabase (Recomendada para academia)

1. Iniciar sesión en https://supabase.com con la cuenta del equipo.
2. Seleccionar el proyecto `ksghpwonmnxmbhmfpaog`.
3. Ir a: **Database** → **Backups** (disponible en plan Pro).
4. Hacer clic en **"Download"** para descargar el backup más reciente.

> ⏳ Si el proyecto está en plan gratuito, esta opción no estará disponible. Usar la Opción B.

### Opción B — Exportar con `pg_dump` (Manual)

Requiere las credenciales de conexión de Supabase (disponibles en Settings → Database):

```bash
# Reemplazar los valores según el dashboard de Supabase
pg_dump \
  --host=db.<project-ref>.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --format=custom \
  --file=emeet_backup_$(date +%Y%m%d_%H%M%S).dump
```

> ⚠️ Se solicitará la contraseña del usuario `postgres` (disponible en el dashboard de Supabase bajo Settings → Database → Database password).

### Opción C — Exportar datos desde el Editor SQL de Supabase

Para tablas individuales, desde el dashboard de Supabase:

1. Ir a: **SQL Editor**.
2. Ejecutar la consulta de selección deseada:
   ```sql
   SELECT * FROM profiles;
   SELECT * FROM user_events;
   SELECT * FROM chat_messages;
   -- etc.
   ```
3. Hacer clic en **"Export"** para descargar como CSV.

---

## 4. Pasos para Restaurar en Ambiente de Pruebas

> ⚠️ La restauración debe hacerse en un **proyecto Supabase separado** destinado a pruebas. **Nunca restaurar directamente sobre el proyecto de producción sin respaldo previo.**

### Restaurar desde archivo `.dump` (pg_restore):

```bash
# Crear la base de datos de destino (si no existe)
psql \
  --host=db.<test-project-ref>.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --command="CREATE DATABASE emeet_test;"

# Restaurar el backup
pg_restore \
  --host=db.<test-project-ref>.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --verbose \
  emeet_backup_YYYYMMDD_HHMMSS.dump
```

---

## 5. Evidencia Esperada para Entrega Académica

| Evidencia | Descripción |
|---|---|
| Captura del dashboard de Supabase | Mostrar las tablas con filas de datos reales |
| Archivo de backup descargado | `.dump` o `.csv` por tabla, guardado localmente |
| Captura del proceso de exportación | Screenshot del paso de descarga en Supabase |
| Fecha y hora del backup | Indicar cuándo se realizó el respaldo |

---

## 6. Riesgos Relacionados con los Datos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Pérdida de datos en Supabase (plan gratuito sin backup automático) | Media | Alto | Realizar backups manuales regulares |
| Eliminación accidental de tablas durante desarrollo | Baja | Alto | Usar SQL cuidadoso; nunca DROP TABLE en producción sin backup previo |
| Exposición de datos personales de usuarios de prueba | Media | Alto | Usar solo datos de prueba ficticios durante el desarrollo académico |
| Pérdida de acceso al proyecto Supabase | Baja | Alto | Todos los integrantes del equipo deben tener acceso al dashboard |
| Cambios en el esquema sin migración documentada | Media | Medio | Documentar cambios de esquema en `Datos-y-script.md` |

---

## 7. Recomendaciones

1. **Actualizar al plan Pro de Supabase** antes de la entrega final si es posible, para disponer de backups automáticos diarios con punto de restauración.
2. **Realizar al menos un backup manual** antes de la presentación académica y guardarlo en un lugar seguro (Drive, repositorio privado, etc.).
3. **No usar datos reales de personas** en el ambiente de pruebas; solo datos ficticios inventados.
4. **Registrar la fecha y contenido** de cada backup realizado.
5. **Configurar notificaciones de alertas** en Supabase para ser notificados ante problemas de la base de datos.
6. **Mantener documentado el esquema** en `Producto/Datos-y-script.md` para poder reconstruir la base de datos desde cero si fuera necesario.

---

## 8. Información Pendiente por Validar

| Elemento | Estado |
|---|---|
| Plan de Supabase actual (Free vs Pro) | ⏳ Verificar en el dashboard de Supabase |
| Backup automático activado | ⏳ Disponible solo en plan Pro |
| Credenciales de acceso a la base de datos | ⏳ Disponibles en Settings → Database del dashboard |
| Estructura completa del esquema SQL | ⏳ Pendiente — revisar con `eMeet_Backend_Supabase` |
| Procedimiento de backup del backend | ⏳ Pendiente — depende de la infraestructura de `eMeet_Backend_Supabase` |
