# Diagramas UML — eMeet

> Este documento describe los diagramas UML del sistema eMeet. Los diagramas en formato imagen o archivo de diseño (`.drawio`, `.puml`, `.png`) deben colocarse en esta misma carpeta.

---

## 1. Diagrama de casos de uso

### Actores
- **Usuario**: usuario autenticado que consume eventos.
- **Locatario**: organizador de eventos.
- **Admin**: moderador del sistema.
- **Sistema externo**: Google Maps Places API.

### Casos de uso principales

```
[Usuario]
  ├── Registrarse / Iniciar sesión
  ├── Ver y editar perfil
  ├── Buscar eventos
  ├── Dar like / guardar evento
  ├── Unirse a sala de chat
  ├── Enviar / recibir mensajes
  └── Comprar ticket / suscripción

[Locatario]
  ├── Registrarse como locatario
  ├── Crear / editar / eliminar eventos
  └── Ver transacciones de sus eventos

[Admin]
  ├── Ver reportes de moderación
  ├── Resolver / desestimar reportes
  ├── Ver KPIs de la plataforma
  └── Gestionar roles de usuarios

[Sistema externo - Google Maps]
  └── Buscar lugares cercanos (Places API)
```

---

## 2. Diagrama de secuencia — Autenticación

```
Usuario     Frontend       Backend           Supabase Auth
  |            |              |                    |
  |--login---->|              |                    |
  |            |--POST /auth/login---------------->|
  |            |              |--signInWithPassword|
  |            |              |<--access_token-----|
  |            |<--access_token------------------- |
  |<--sesión---|              |                    |
```

---

## 3. Diagrama de secuencia — Crear evento (Locatario)

```
Locatario   Frontend       Backend           Supabase DB
  |            |              |                    |
  |--form----->|              |                    |
  |            |--POST /events/locatario----------->|
  |            |   Authorization: Bearer            |
  |            |              |--validateJWT------->|
  |            |              |<--user (locatario)--|
  |            |              |--INSERT event------>|
  |            |              |<--event created-----|
  |            |<--201 event--|                    |
  |<--success--|              |                    |
```

---

## 4. Diagrama de clases (simplificado)

```
┌──────────────┐       ┌─────────────────┐
│   Profile    │       │  LocatarioEvent │
│──────────────│       │─────────────────│
│ id           │       │ id              │
│ username     │       │ title           │
│ bio          │       │ description     │
│ avatar_url   │       │ location        │
│ role         │       │ date            │
│ interests    │       │ price           │
└──────┬───────┘       │ status          │
       │               │ organizer_id ───┼──► Profile
       │               └────────┬────────┘
       │                        │
       │               ┌────────▼────────┐
       │               │   UserEvent     │
       │               │─────────────────│
       │               │ user_id ────────┼──► Profile
       │               │ event_id        │
       │               │ action (like/save)│
       │               └─────────────────┘
       │
       │    ┌─────────────┐     ┌──────────────┐
       │    │  ChatRoom   │     │  ChatMessage │
       │    │─────────────│     │──────────────│
       │    │ id          │     │ id           │
       │    │ event_id    │     │ room_id ─────┼──► ChatRoom
       │    │ name        │     │ user_id ─────┼──► Profile
       │    └──────┬──────┘     │ content      │
       │           │            │ created_at   │
       │    ┌──────▼──────┐     └──────────────┘
       │    │ RoomMember  │
       │    │─────────────│
       │    │ room_id     │
       │    │ user_id ────┼──► Profile
       │    └─────────────┘
```

---

## 5. Diagrama de componentes

```
┌──────────────────────────────────────────────┐
│                  Backend API                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Routes  │→ │Middleware│→ │ Services  │  │
│  └──────────┘  └──────────┘  └───────────┘  │
│       │                           │          │
│  ┌────▼───────────────────────────▼───────┐  │
│  │               Lib                      │  │
│  │  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │  Supabase    │  │    Prisma    │   │  │
│  │  └──────────────┘  └──────────────┘   │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```
