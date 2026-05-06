# Modelo de Base de Datos — eMeet

## Plataforma

- **Proveedor:** Supabase (PostgreSQL gestionado)
- **Herramienta de modelado:** Prisma ORM (`prisma/schema.prisma`)
- **Migraciones:** scripts SQL en `supabase/`

---

## Tablas principales

### `profiles`
Perfil de usuario (ligado a `auth.users` de Supabase).

| Campo             | Tipo         | Descripción                              |
|-------------------|--------------|------------------------------------------|
| `id`              | UUID (PK)    | ID del usuario (referencia auth.users)   |
| `name`            | TEXT         | Nombre del usuario                       |
| `role`            | TEXT         | Rol: `user`, `locatario`, `admin`        |
| `bio`             | TEXT         | Descripción personal                     |
| `avatar_url`      | TEXT?        | URL de la foto de perfil                 |
| `location`        | TEXT         | Ubicación                                |
| `business_name`   | TEXT?        | Nombre del negocio (para locatarios)     |
| `business_location`| TEXT?       | Dirección del negocio                    |
| `interests`       | TEXT[]       | Array de intereses del usuario           |
| `created_at`      | TIMESTAMPTZ  | Fecha de creación                        |

---

### `locatario_events`
Eventos creados por usuarios con rol `locatario`.

| Campo             | Tipo         | Descripción                              |
|-------------------|--------------|------------------------------------------|
| `id`              | UUID (PK)    | Identificador único del evento           |
| `creator_id`      | UUID (FK)    | Referencia a `profiles.id`               |
| `title`           | TEXT         | Título del evento                        |
| `description`     | TEXT         | Descripción                              |
| `category`        | TEXT         | Categoría (gastronomía, música, etc.)    |
| `event_date`      | TIMESTAMPTZ  | Fecha y hora del evento                  |
| `address`         | TEXT         | Dirección                                |
| `price`           | DECIMAL?     | Precio de entrada                        |
| `image_url`       | TEXT?        | Imagen del evento                        |
| `video_url`       | TEXT?        | Video del evento                         |
| `organizer_name`  | TEXT         | Nombre del organizador                   |
| `lat` / `lng`     | DECIMAL?     | Coordenadas geográficas                  |
| `status`          | TEXT         | `draft`, `live`, `flagged`               |
| `created_at`      | TIMESTAMPTZ  | Fecha de creación                        |

---

### `user_events`
Acciones de usuarios sobre eventos (likes, guardados, asistencia).

| Campo             | Tipo         | Descripción                              |
|-------------------|--------------|------------------------------------------|
| `id`              | UUID (PK)    | Identificador único                      |
| `user_id`         | UUID (FK)    | Referencia a `profiles.id`               |
| `event_id`        | TEXT         | ID del evento                            |
| `event_title`     | TEXT?        | Título del evento (desnormalizado)       |
| `event_image_url` | TEXT?        | Imagen del evento                        |
| `event_address`   | TEXT?        | Dirección del evento                     |
| `action`          | TEXT         | `like`, `save`, `attend`                 |
| `created_at`      | TIMESTAMPTZ  | Fecha de la acción                       |

---

### `chat_rooms`
Salas de chat vinculadas a eventos.

| Campo             | Tipo         | Descripción                              |
|-------------------|--------------|------------------------------------------|
| `id`              | TEXT (PK)    | ID de la sala (generalmente = event_id)  |
| `event_title`     | TEXT         | Título del evento                        |
| `event_image_url` | TEXT?        | Imagen del evento                        |
| `event_address`   | TEXT?        | Dirección del evento                     |
| `created_at`      | TIMESTAMPTZ  | Fecha de creación                        |

---

### `room_members`
Participantes de cada sala de chat.

| Campo         | Tipo         | Descripción                          |
|---------------|--------------|--------------------------------------|
| `room_id`     | TEXT (FK)    | Referencia a `chat_rooms.id`         |
| `user_id`     | UUID (FK)    | Referencia a `profiles.id`           |
| `joined_at`   | TIMESTAMPTZ  | Fecha en que se unió                 |
| `last_read_at`| TIMESTAMPTZ  | Último mensaje leído                 |

---

### `chat_messages`
Mensajes dentro de salas de chat.

| Campo       | Tipo         | Descripción                          |
|-------------|--------------|--------------------------------------|
| `id`        | UUID (PK)    | Identificador del mensaje            |
| `room_id`   | TEXT (FK)    | Referencia a `chat_rooms.id`         |
| `user_id`   | UUID (FK)    | Referencia a `profiles.id`           |
| `text`      | TEXT         | Contenido del mensaje                |
| `created_at`| TIMESTAMPTZ  | Fecha del mensaje                    |

---

### `reports`
Reportes de moderación sobre eventos o usuarios.

| Campo         | Tipo         | Descripción                                        |
|---------------|--------------|----------------------------------------------------|
| `id`          | UUID (PK)    | Identificador del reporte                          |
| `type`        | TEXT         | `spam`, `inappropriate`, `fake`, `other`           |
| `description` | TEXT         | Detalle del reporte                                |
| `target_type` | TEXT         | `event`, `user`, `comment`                         |
| `target_id`   | TEXT         | ID del elemento reportado                          |
| `reporter_id` | UUID (FK)    | Referencia a `profiles.id`                         |
| `status`      | TEXT         | `pending`, `resolved`, `dismissed`                 |
| `resolved_by` | UUID? (FK)   | Admin que resolvió el reporte                      |
| `resolved_at` | TIMESTAMPTZ? | Fecha de resolución                                |
| `created_at`  | TIMESTAMPTZ  | Fecha del reporte                                  |

---

### `transactions`
Transacciones financieras (tickets, suscripciones, comisiones).

| Campo         | Tipo         | Descripción                                        |
|---------------|--------------|----------------------------------------------------|
| `id`          | UUID (PK)    | Identificador de la transacción                    |
| `type`        | TEXT         | `ticket`, `suscripcion`, `comision`                |
| `description` | TEXT         | Descripción                                        |
| `amount`      | DECIMAL      | Monto                                              |
| `status`      | TEXT         | `completado`, `pendiente`, `reembolsado`           |
| `event_id`    | UUID? (FK)   | Referencia a `locatario_events.id`                 |
| `user_id`     | UUID? (FK)   | Referencia a `profiles.id`                         |
| `created_at`  | TIMESTAMPTZ  | Fecha de la transacción                            |

---

## Relaciones principales

```
auth.users ──1:1──► profiles
profiles ──1:N──► locatario_events
profiles ──1:N──► user_events
profiles ──1:N──► chat_messages
profiles ──M:N──► chat_rooms (via room_members)
profiles ──1:N──► reports (como reporter)
profiles ──1:N──► reports (como resolver)
profiles ──1:N──► transactions
locatario_events ──1:N──► transactions
chat_rooms ──1:N──► chat_messages
chat_rooms ──1:N──► room_members
```

---

## Migraciones

Los scripts de migración se encuentran en `supabase/` y deben ejecutarse en orden:

| Archivo                              | Descripción                                |
|--------------------------------------|--------------------------------------------|
| `001_emeet_schema.sql`               | Esquema base (profiles, chat, user_events) |
| `002_locatario_events.sql`           | Tabla de eventos de locatarios             |
| `003_realtime_identity.sql`          | Configuración Realtime                     |
| `004_fix_policies.sql`               | Correcciones de políticas RLS              |
| `005_reports.sql`                    | Tabla de reportes de moderación            |
| `006_transactions_and_event_status.sql` | Transacciones y estado de eventos       |
| `007_cleanup_event_payment_fields.sql`  | Limpieza de campos de pago               |
| `008_profiles_role_business_fields.sql` | Campos de rol y negocio en profiles     |
