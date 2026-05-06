# Arquitectura del sistema — eMeet

## Visión general

eMeet sigue una arquitectura de tres capas desacoplada:

```
┌─────────────────────────────────────────────┐
│             CAPA DE PRESENTACIÓN            │
│   Next.js (Vercel) — Frontend               │
└────────────────────┬────────────────────────┘
                     │ HTTPS / REST API
┌────────────────────▼────────────────────────┐
│              CAPA DE NEGOCIO                │
│   Express + TypeScript (Render) — Backend   │
│                                             │
│  Middlewares: Auth, Helmet, CORS, Morgan    │
│  Rutas: auth, profile, events, chat,        │
│         places, admin, monetization         │
└────────┬───────────────────┬────────────────┘
         │ Prisma ORM        │ Supabase JS SDK
┌────────▼───────────────────▼────────────────┐
│              CAPA DE DATOS                  │
│   Supabase (PostgreSQL + Auth + Storage)    │
│                                             │
│  Tablas: profiles, locatario_events,        │
│  user_events, chat_rooms, room_members,     │
│  chat_messages, reports, transactions       │
└─────────────────────────────────────────────┘
```

---

## Componentes del backend

### `src/app.ts`
Configura Express con todos los middlewares y registra las rutas.

### `src/server.ts`
Entry point: inicia el servidor HTTP en el puerto configurado.

### `src/config/`
Carga y exporta variables de entorno.

### `src/routes/`
Handlers HTTP organizados por dominio:
- `auth.routes.ts` — Login, registro, sesión
- `profile.routes.ts` — Perfil de usuario
- `events.routes.ts` — CRUD de eventos
- `chat.routes.ts` — Chat en tiempo real
- `places.routes.ts` — Google Maps Places API
- `admin.routes.ts` — Panel de administración
- `monetization.routes.ts` — Transacciones

### `src/middleware/`
- `auth.ts` — Valida JWT con Supabase y adjunta el usuario al request.

### `src/services/`
- Lógica de integración con Google Places API.

### `src/lib/`
- `supabase.ts` — Cliente Supabase (anon y service role).
- `prisma.ts` — Cliente Prisma ORM.

### `src/schemas/`
- Validaciones de entrada con Zod.

### `prisma/schema.prisma`
Modelos de base de datos: Profile, LocatarioEvent, UserEvent, ChatRoom, RoomMember, ChatMessage, Report, Transaction.

### `supabase/`
- Scripts SQL de migración y configuración inicial (RLS, Storage, Realtime).

---

## Flujo de autenticación

```
Cliente                  Backend              Supabase Auth
  |                         |                      |
  |-- POST /auth/login ----->|                      |
  |                         |-- signInWithPassword->|
  |                         |<-- JWT access_token --|
  |<-- { access_token } ----|                      |
  |                         |                      |
  |-- GET /profile ----------|                      |
  |   Authorization: Bearer  |                      |
  |                         |-- getUser(token) ---->|
  |                         |<-- user object -------|
  |<-- profile data --------|                      |
```

---

## Patrones de diseño utilizados
- **Router modular**: cada dominio tiene su propio Router de Express.
- **Middleware chain**: autenticación centralizada como middleware reutilizable.
- **Repository pattern**: acceso a datos encapsulado en Prisma.
- **Service layer**: lógica de negocio separada en `services/` cuando aplica.
