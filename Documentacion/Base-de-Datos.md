# Base de Datos — eMeet

## Motor

PostgreSQL gestionado por **Supabase**.

---

## Tablas principales

### `profiles`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Vinculado a `auth.users` |
| `username` | TEXT | Nombre de usuario único |
| `full_name` | TEXT | Nombre completo |
| `bio` | TEXT | Descripción del perfil |
| `interests` | TEXT[] | Intereses del usuario |
| `avatar_url` | TEXT | URL del avatar en Storage |
| `role` | TEXT | `user` / `locatario` / `admin` |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

### `locatario_events`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Identificador del evento |
| `creator_id` | UUID (FK → profiles) | Creador del evento |
| `title` | TEXT | Título |
| `description` | TEXT | Descripción |
| `location` | TEXT | Lugar |
| `event_date` | TIMESTAMPTZ | Fecha del evento |
| `status` | TEXT | `draft` / `active` / `cancelled` |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

### `user_events`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Identificador |
| `user_id` | UUID (FK → profiles) | Usuario |
| `event_id` | UUID (FK → locatario_events) | Evento |
| `action` | TEXT | `like` / `save` / `attend` |
| `created_at` | TIMESTAMPTZ | Fecha de acción |

### `chat_rooms`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Sala |
| `event_id` | UUID (FK → locatario_events) | Evento relacionado |
| `name` | TEXT | Nombre de la sala |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

### `room_members`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `room_id` | UUID (FK → chat_rooms) | Sala |
| `user_id` | UUID (FK → profiles) | Usuario |
| `joined_at` | TIMESTAMPTZ | Fecha de unión |

### `chat_messages`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Mensaje |
| `room_id` | UUID (FK → chat_rooms) | Sala |
| `user_id` | UUID (FK → profiles) | Autor |
| `text` | TEXT | Contenido |
| `created_at` | TIMESTAMPTZ | Fecha de envío |

### `reports`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Reporte |
| `type` | TEXT | `spam` / `inappropriate` / `fake` / `other` |
| `target_type` | TEXT | `event` / `user` / `comment` |
| `target_id` | UUID | ID del elemento reportado |
| `reporter_id` | UUID (FK → profiles) | Quien reporta |
| `status` | TEXT | `pending` / `resolved` / `dismissed` |

### `transactions`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Transacción |
| `type` | TEXT | `ticket` / `suscripcion` / `comision` |
| `amount` | NUMERIC | Monto en CLP |
| `status` | TEXT | `completado` / `pendiente` / `reembolsado` |
| `user_id` | UUID (FK → profiles) | Usuario |
| `event_id` | UUID (FK → locatario_events) | Evento (opcional) |

---

## Índice de archivos de migración

| Archivo | Descripción |
|---------|-------------|
| `supabase/001_emeet_schema.sql` | Esquema completo (tablas, índices, RLS, trigger, Realtime, Storage) |
| `Producto/Base-de-Datos/Script-BD.sql` | Script consolidado listo para despliegue |
| `Producto/Base-de-Datos/Procedimientos-Almacenados.sql` | Funciones PL/pgSQL |
| `Producto/Base-de-Datos/Datos-Prueba.sql` | Seed data para ambiente de pruebas |
