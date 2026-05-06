# Arquitectura del Backend — eMeet

## Descripción general

eMeet Backend es una **API REST** que expone los servicios necesarios para la plataforma social de eventos **eMeet**. Está construida con **Node.js + Express + TypeScript** y usa **Supabase** como proveedor de base de datos y autenticación.

---

## Stack tecnológico

| Tecnología | Versión / Rol |
|------------|--------------|
| Node.js | Runtime principal |
| Express | Framework HTTP |
| TypeScript | Lenguaje (tipado estático) |
| Supabase | Auth + Base de datos PostgreSQL |
| Prisma ORM | Acceso y modelado de datos |
| PL/pgSQL | Funciones y migraciones SQL |
| Helmet | Seguridad HTTP (headers) |
| CORS | Control de acceso por origen |
| Morgan | Logging de requests |
| Vitest | Testing unitario |
| Render | Plataforma de despliegue |

---

## Estructura del proyecto

```
src/
├── app.ts              # Configuración Express, middlewares, rutas
├── server.ts           # Entry point
├── config/             # Variables de entorno
├── routes/             # Rutas organizadas por módulo
│   ├── auth.routes.ts
│   ├── profile.routes.ts
│   ├── events.routes.ts
│   ├── chat.routes.ts
│   ├── places.routes.ts
│   ├── admin.routes.ts
│   └── monetization.routes.ts
├── middleware/         # Auth middleware + tests
├── services/           # Lógica de negocio (Places API)
├── schemas/            # Validaciones
├── lib/                # Clientes (Supabase, Prisma)
├── types/              # Tipados TypeScript
├── constants/          # Constantes
└── utils/              # Utilidades
prisma/
└── schema.prisma       # Modelos de BD
supabase/
└── 001_emeet_schema.sql  # Migración inicial
```

---

## Módulos principales

| Prefijo | Archivo | Descripción |
|---------|---------|-------------|
| `/health` | `app.ts` | Health check |
| `/auth` | `auth.routes.ts` | Login, registro, sesión, logout |
| `/profile` | `profile.routes.ts` | Perfil, avatar |
| `/events` | `events.routes.ts` | Eventos, likes, saves |
| `/chat` | `chat.routes.ts` | Salas y mensajes |
| `/places` | `places.routes.ts` | Google Maps Places API |
| `/admin` | `admin.routes.ts` | Moderación de reportes |
| `/monetization` | `monetization.routes.ts` | Pagos y transacciones |

---

## Flujo de autenticación

1. Cliente llama `POST /auth/login` o `POST /auth/register`.
2. Supabase Auth valida credenciales y emite JWT.
3. Cliente incluye `Authorization: Bearer <token>` en requests protegidos.
4. Middleware `withAuth` verifica el token con Supabase antes de ejecutar el handler.

---

## Seguridad

- `helmet()` agrega headers HTTP de seguridad.
- CORS restrictivo: whitelist de dominios + regex para previews de Vercel.
- Row Level Security (RLS) habilitado en Supabase para todas las tablas sensibles.
- Claves de servicio solo se usan en rutas admin (nunca expuestas al cliente).
