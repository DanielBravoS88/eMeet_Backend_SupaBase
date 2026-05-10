# Modelo Entidad-Relación (MER) — eMeet

> Este documento describe el modelo entidad-relación de la base de datos de eMeet. El diagrama visual (`.png`, `.pdf`, `.drawio`) debe colocarse en esta misma carpeta.

---

## Entidades y atributos

### Profile (usuarios)
| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id | UUID (PK) | Identificador único (mismo que auth.users) |
| username | TEXT | Nombre de usuario único |
| bio | TEXT | Descripción personal |
| avatar_url | TEXT | URL del avatar en Supabase Storage |
| role | TEXT | Rol: `admin`, `locatario`, `user` |
| interests | TEXT[] | Lista de intereses del usuario |
| created_at | TIMESTAMP | Fecha de creación |

### LocatarioEvent (eventos)
| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id | UUID (PK) | Identificador único |
| organizer_id | UUID (FK → Profile) | Organizador del evento |
| title | TEXT | Título del evento |
| description | TEXT | Descripción |
| location | TEXT | Dirección o nombre del lugar |
| latitude | FLOAT | Coordenada geográfica |
| longitude | FLOAT | Coordenada geográfica |
| date | TIMESTAMP | Fecha y hora del evento |
| price | DECIMAL | Precio de entrada |
| capacity | INT | Capacidad máxima |
| status | TEXT | `draft`, `published`, `cancelled` |
| created_at | TIMESTAMP | Fecha de creación |

### UserEvent (interacciones usuario-evento)
| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id | UUID (PK) | Identificador único |
| user_id | UUID (FK → Profile) | Usuario |
| event_id | UUID (FK → LocatarioEvent) | Evento |
| action | TEXT | `like`, `save`, `attend` |
| created_at | TIMESTAMP | Fecha de la acción |

### ChatRoom (salas de chat)
| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id | UUID (PK) | Identificador único |
| event_id | UUID (FK → LocatarioEvent) | Evento asociado |
| name | TEXT | Nombre de la sala |
| created_at | TIMESTAMP | Fecha de creación |

### RoomMember (miembros de sala)
| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id | UUID (PK) | Identificador único |
| room_id | UUID (FK → ChatRoom) | Sala de chat |
| user_id | UUID (FK → Profile) | Usuario miembro |
| last_read_at | TIMESTAMP | Último mensaje leído |
| joined_at | TIMESTAMP | Fecha de ingreso |

### ChatMessage (mensajes)
| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id | UUID (PK) | Identificador único |
| room_id | UUID (FK → ChatRoom) | Sala de chat |
| user_id | UUID (FK → Profile) | Autor del mensaje |
| content | TEXT | Contenido del mensaje |
| created_at | TIMESTAMP | Fecha de envío |

### Report (reportes de moderación)
| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id | UUID (PK) | Identificador único |
| reporter_id | UUID (FK → Profile) | Usuario que reporta |
| type | TEXT | `spam`, `inappropriate`, `fake`, `other` |
| description | TEXT | Detalle del reporte |
| target_type | TEXT | `event`, `user`, `comment` |
| target_id | UUID | ID del elemento reportado |
| status | TEXT | `pending`, `resolved`, `dismissed` |
| created_at | TIMESTAMP | Fecha del reporte |

### Transaction (transacciones)
| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id | UUID (PK) | Identificador único |
| user_id | UUID (FK → Profile) | Usuario involucrado |
| event_id | UUID (FK → LocatarioEvent) | Evento relacionado |
| type | TEXT | `ticket`, `subscription`, `commission` |
| amount | DECIMAL | Monto de la transacción |
| status | TEXT | `pending`, `completado`, `failed` |
| created_at | TIMESTAMP | Fecha de la transacción |

---

## Relaciones

```
Profile ──────────────────────── LocatarioEvent
  │ (organizer_id)                     │
  │                                    │
  ├──── UserEvent ────────────────────┘
  │       (user_id, event_id)
  │
  ├──── RoomMember ─────── ChatRoom ─── LocatarioEvent
  │       (user_id)           │ (event_id)
  │                           │
  └──── ChatMessage ──────────┘
          (user_id, room_id)

Profile ──── Report
  (reporter_id)

Profile ──── Transaction ─── LocatarioEvent
  (user_id)                     (event_id)
```

---

## Diagrama MER (texto)

```
[Profile] 1 ──< [LocatarioEvent]      (un perfil crea muchos eventos)
[Profile] 1 ──< [UserEvent]           (un perfil tiene muchas interacciones)
[LocatarioEvent] 1 ──< [UserEvent]    (un evento tiene muchas interacciones)
[LocatarioEvent] 1 ── 1 [ChatRoom]    (un evento tiene una sala de chat)
[ChatRoom] 1 ──< [RoomMember]         (una sala tiene muchos miembros)
[ChatRoom] 1 ──< [ChatMessage]        (una sala tiene muchos mensajes)
[Profile] 1 ──< [ChatMessage]         (un perfil escribe muchos mensajes)
[Profile] 1 ──< [Report]              (un perfil hace muchos reportes)
[Profile] 1 ──< [Transaction]         (un perfil tiene muchas transacciones)
[LocatarioEvent] 1 ──< [Transaction]  (un evento tiene muchas transacciones)
```
