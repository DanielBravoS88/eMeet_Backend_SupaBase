# Base de Datos — eMeet

## Motor

PostgreSQL gestionado por **Supabase**.

---

## Tablas principales

### `profiles`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Vinculado a `auth.users` |
| `name` | TEXT | Nombre del usuario |
| `role` | TEXT | `user` / `locatario` / `admin` |
| `bio` | TEXT | Descripción del perfil |
| `avatar_url` | TEXT | URL del avatar en Storage |
| `location` | TEXT | Ubicación del usuario |
| `business_name` | TEXT | Nombre del negocio (solo locatarios) |
| `business_location` | TEXT | Ubicación del negocio (solo locatarios) |
| `interests` | TEXT[] | Intereses (gastronomia, musica, cultura, etc.) |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

### `user_events`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Identificador |
| `user_id` | UUID (FK → profiles) | Usuario |
| `event_id` | TEXT | ID externo del evento |
| `event_title` | TEXT | Título del evento (cache) |
| `event_image_url` | TEXT | Imagen del evento (cache) |
| `event_address` | TEXT | Dirección del evento (cache) |
| `action` | TEXT | `like` / `save` |
| `created_at` | TIMESTAMPTZ | Fecha de acción |

### `chat_rooms`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | TEXT (PK) | Identificador de la sala |
| `event_title` | TEXT | Título del evento asociado |
| `event_image_url` | TEXT | Imagen del evento (cache) |
| `event_address` | TEXT | Dirección del evento (cache) |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

### `room_members`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `room_id` | TEXT (FK → chat_rooms) | Sala |
| `user_id` | UUID (FK → profiles) | Usuario |
| `joined_at` | TIMESTAMPTZ | Fecha de unión |
| `last_read_at` | TIMESTAMPTZ | Último mensaje leído |

### `chat_messages`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Mensaje |
| `room_id` | TEXT (FK → chat_rooms) | Sala |
| `user_id` | UUID (FK → profiles) | Autor |
| `text` | TEXT | Contenido |
| `created_at` | TIMESTAMPTZ | Fecha de envío |

---

## Índice de archivos de migración

| Archivo | Descripción |
|---------|-------------|
| `supabase/001_emeet_schema.sql` | Esquema completo (tablas, índices, RLS, trigger, Realtime, Storage) |
| `Producto/Base-de-Datos/Script-BD.sql` | Script consolidado listo para despliegue (mismo contenido que el anterior) |
| `Producto/Base-de-Datos/Procedimientos-Almacenados.sql` | Funciones PL/pgSQL adicionales (`get_unread_count`, `get_room_unread_count`, `mark_room_as_read`) |
| `Producto/Base-de-Datos/Datos-Prueba.sql` | Seed data para ambiente de desarrollo/testing |
