# Arquitectura del Backend — eMeet

## Descripción general

eMeet Backend es una **API REST** que expone los servicios necesarios para la plataforma social de eventos **eMeet**. Está construida con **Node.js + Express + TypeScript** y usa **Supabase** como proveedor de base de datos y autenticación.

---

## Stack tecnológico

| Tecnología             | Versión  | Rol                                      |
|------------------------|----------|------------------------------------------|
| Node.js                | ≥ 18     | Entorno de ejecución                     |
| Express                | 4.x      | Framework HTTP                           |
| TypeScript             | 5.x      | Lenguaje principal                       |
| Supabase               | —        | Auth + PostgreSQL + Storage + Realtime   |
| Prisma ORM             | 5.x      | Modelado y acceso a datos                |
| Helmet                 | —        | Seguridad HTTP (headers)                 |
| CORS                   | —        | Control de acceso entre orígenes         |
| Morgan                 | —        | Logging de peticiones HTTP               |
| Vitest                 | —        | Framework de testing unitario            |

---

## Estructura del proyecto

```
src/
├── app.ts            # Configuración Express, middlewares globales, rutas
├── server.ts         # Entry point (inicia el servidor)
├── config/           # Variables de entorno y configuración global
├── routes/           # Rutas organizadas por módulo
│   ├── auth.routes.ts
│   ├── profile.routes.ts
│   ├── events.routes.ts
│   ├── chat.routes.ts
│   ├── places.routes.ts
│   ├── admin.routes.ts
│   └── monetization.routes.ts
├── middleware/        # Middlewares (autenticación JWT, etc.)
├── services/         # Lógica de negocio (ej. Google Places API)
├── schemas/          # Validaciones de entrada (Zod u otros)
├── lib/              # Clientes (Supabase, Prisma)
├── types/            # Tipados TypeScript del dominio
├── constants/        # Constantes globales
└── utils/            # Funciones utilitarias (respuestas HTTP, etc.)

prisma/
└── schema.prisma     # Modelos de base de datos

supabase/
└── *.sql             # Migraciones SQL (esquema, políticas RLS, etc.)
```

---

## Módulos principales

### `/auth`
Autenticación de usuarios con Supabase Auth (email/password).

### `/profile`
Gestión de perfil de usuario: datos personales, avatar (Supabase Storage), intereses.

### `/events`
CRUD de eventos creados por locatarios. Acciones de usuario: likes, guardados.

### `/chat`
Salas de chat en tiempo real vinculadas a eventos (Supabase Realtime).

### `/places`
Integración con Google Maps Places API para autocompletar direcciones.

### `/admin`
Moderación: gestión de reportes (spam, contenido inapropiado, etc.) y panel de KPIs.

### `/monetization`
Transacciones: tickets, suscripciones y comisiones. Historial de pagos.

---

## Flujo de autenticación

```
Cliente ──► POST /auth/login ──► Supabase Auth
                                      │
                              access_token (JWT)
                                      │
Cliente ──► GET /protected   ──► middleware/auth.ts
                                      │
                              supabase.auth.getUser(token)
                                      │
                              ✅ autorizado / ❌ 401
```

---

## Seguridad

- **Helmet:** Configura headers de seguridad HTTP por defecto.
- **CORS:** Lista blanca de orígenes permitidos + soporte dinámico para `*.vercel.app`.
- **Auth middleware:** Verifica JWT de Supabase en cada ruta protegida.
- **RLS (Row Level Security):** Habilitado en Supabase para proteger datos a nivel de base de datos.

---

## Despliegue

- **Plataforma:** Render (Web Service, Node.js)
- **Build:** `npm run build` (compila TypeScript a JavaScript)
- **Start:** `npm run start` (ejecuta desde `dist/`)
