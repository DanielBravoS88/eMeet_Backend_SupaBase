# Arquitectura del Sistema eMeet

---

## 1. Tipo de Arquitectura

El sistema eMeet adopta una arquitectura de **tres capas directa sin BFF**:

- **Capa de Presentación**: frontend Next.js 14 App Router con componentes React. Se comunica directamente con el backend Express mediante `fetchApi()` + Bearer JWT.
- **Capa de Lógica de Negocio**: backend `eMeet_Backend_Supabase` (Express.js en Render). Concentra toda la lógica de negocio, seguridad y proxy de servicios externos. Los Route Handlers de Next.js (`app/api/`) manejan exclusivamente operaciones admin con Service Role Key, el proxy de Deezer y el callback OAuth — no actúan como BFF general.
- **Capa de Datos**: Supabase PostgreSQL (14 tablas), con Auth JWT, Realtime WebSocket y Storage. El frontend accede directamente a Supabase Auth y Realtime; el backend accede a Supabase para CRUD de datos.

---

## 2. Componentes del Sistema

### 2.1 Frontend — `eMeet_frontend`

| Componente | Tecnología | Descripción |
|---|---|---|
| App Router | Next.js 14 | Sistema de rutas basado en carpetas `app/` |
| UI | React 18 + TypeScript 5.6 | Componentes declarativos con tipado estricto |
| Estilos | Tailwind CSS 3.4 | Utilidades CSS, mobile-first |
| Animaciones | Framer Motion 11 | Swipe gestural, transiciones |
| Iconos | React Icons 5 + Lucide React | Iconografía SVG |
| Gráficos | Recharts 3.8 | Visualizaciones para el panel admin |
| Carga de progreso | nextjs-toploader | Indicador de carga en navegación |

### 2.2 Backend — `eMeet_Backend_Supabase`

**URL de producción**: https://emeet-backend-supabase-p0i6.onrender.com

| Componente | Tecnología | Descripción |
|---|---|---|
| Framework | Express.js 4.21 | API REST |
| Runtime | Node.js 20 | Servidor |
| Lenguaje | TypeScript 5.6 | Tipado estático |
| ORM | Prisma 6.19 | Operaciones relacionales en PostgreSQL |
| DB Client | Supabase JS Client 2.56 | Auth, RPC y Storage |
| Seguridad | Helmet 8.0 | Headers HTTP seguros |
| CORS | cors + regex | Dinámico: `FRONTEND_ORIGIN`, localhost y `*.vercel.app` |
| Logging | Morgan 1.10 | Request logging |
| Testing | Vitest 4.1 + Supertest | Tests unitarios e integración |

**Grupos de rutas confirmados (src/app.ts)**:

| Ruta | Funcionalidad |
|---|---|
| `GET /health` | Health check del servicio |
| `/auth` | login, register, logout, reset-password |
| `/profile` | GET y PATCH de perfil, subida de avatar |
| `/events` | like, save, CRUD de eventos de locatario |
| `/chat` | rooms, messages, join, read |
| `/places` | search-nearby, photo proxy de Google Maps |
| `/admin` | stats, reports, gestión de usuarios |
| `/monetization` | tokens, pagos, QR, cupones, campañas |

### 2.3 Supabase (plataforma backend)

**Proyecto**: ksghpwonmnxmbhmfpaog

| Servicio | Uso en el sistema |
|---|---|
| **Auth** | Registro, login, OAuth (Google/Apple), verificación de email, tokens JWT RS256 |
| **PostgreSQL** | 14 tablas: `profiles`, `user_events`, `chat_rooms`, `room_members`, `chat_messages`, `locatario_events`, `token_wallets`, `token_transactions`, `payment_orders`, `promotion_campaigns`, `coupons`, `transactions`, `reports`, `qr_validations` |
| **Realtime** | Suscripción a `postgres_changes` en `chat_messages` para chat en tiempo real (WebSocket) |
| **Storage** | Buckets: `avatars`, `event-images`, `event-videos` |
| **SSR** | Cookie-based sessions con `@supabase/ssr` en middleware Next.js |

---

## 3. Capa de Presentación

La capa de presentación corresponde al repositorio `eMeet_frontend`. Es una aplicación web mobile-first construida con Next.js 14 App Router. El renderizado por defecto es Server Component; los Client Components se usan únicamente donde se requieren eventos del navegador, gestión de estado interactivo o APIs del cliente (como `navigator.geolocation` o WebSockets).

### Rutas principales detectadas:

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Autenticado | Feed principal con swipe de lugares |
| `/auth` | Público | Login y registro |
| `/auth/callback` | Público | Callback para OAuth (Google/Apple) |
| `/auth/verify-email` | Público | Pantalla de verificación de email |
| `/search` | Autenticado | Búsqueda y exploración de lugares |
| `/saved` | Autenticado | Lista de lugares guardados |
| `/profile` | Autenticado | Perfil del usuario |
| `/chat` | Autenticado | Lista de salas de chat |
| `/chat/[roomId]` | Autenticado | Sala de chat individual |
| `/admin` | Solo `admin` | Dashboard de administración |
| `/admin/events` | Solo `admin` | Gestión de eventos |
| `/admin/users` | Solo `admin` | Gestión de usuarios |
| `/admin/moderation` | Solo `admin` | Moderación de contenido |
| `/admin/finance` | Solo `admin` | Finanzas y reportes |
| `/locatario` | Solo `locatario` | Panel de locatario |

---

## 4. Capa de Lógica de Negocio (Backend Express)

La lógica de negocio centralizada reside en `eMeet_Backend_SupaBase` (Express.js, Render). El frontend consume el backend directamente mediante `fetchApi()` + Bearer JWT desde sus contextos globales. Los Route Handlers de Next.js (`app/api/`) son auxiliares específicos — no actúan como BFF general.

### Route Handlers del frontend (app/api/) — uso específico:

```
app/api/
  admin/
    stats/route.ts          ← Supabase Service Role Key (operaciones admin)
    reports/route.ts        ← Supabase Service Role Key
    reports/[id]/route.ts   ← Supabase Service Role Key
    finance/route.ts        ← Supabase Service Role Key
  deezer/
    route.ts                ← Proxy hacia Deezer API (música ambiental)
  keepalive/
    route.ts                ← Keep-alive del backend en Render
  auth/
    callback/route.ts       ← Callback OAuth de Supabase
```

---

## 5. Capa de Datos

### 5.1 Tablas confirmadas en Supabase PostgreSQL

Las siguientes tablas fueron confirmadas directamente desde el archivo `src/lib/supabase.ts` (tipo `Database`):

#### Tabla `profiles`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK — igual al `auth.users.id` de Supabase |
| name | TEXT | Nombre del usuario |
| role | ENUM | `'user' \| 'locatario' \| 'admin'` |
| bio | TEXT | Descripción del usuario |
| avatar_url | TEXT (null) | URL del avatar |
| location | TEXT | Ciudad o ubicación del usuario |
| business_name | TEXT (null) | Nombre del negocio (solo locatarios) |
| business_location | TEXT (null) | Ubicación del negocio (solo locatarios) |
| interests | TEXT[] | Categorías de interés del usuario |
| created_at | TIMESTAMPTZ | Fecha de creación |

#### Tabla `user_events`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → profiles.id |
| event_id | TEXT | ID del lugar o evento |
| event_title | TEXT (null) | Título del evento |
| event_image_url | TEXT (null) | Imagen del evento |
| event_address | TEXT (null) | Dirección del evento |
| action | ENUM | `'like' \| 'save'` |
| created_at | TIMESTAMPTZ | Fecha de la acción |

#### Tabla `chat_rooms`
| Campo | Tipo | Descripción |
|---|---|---|
| id | TEXT | PK (igual al placeId del lugar) |
| event_title | TEXT | Nombre de la sala |
| event_image_url | TEXT (null) | Imagen del lugar |
| event_address | TEXT (null) | Dirección del lugar |
| created_at | TIMESTAMPTZ | Fecha de creación |

#### Tabla `room_members`
| Campo | Tipo | Descripción |
|---|---|---|
| room_id | TEXT | FK → chat_rooms.id |
| user_id | UUID | FK → profiles.id |
| joined_at | TIMESTAMPTZ | Fecha de ingreso |
| last_read_at | TIMESTAMPTZ | Última lectura |

#### Tabla `chat_messages`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| room_id | TEXT | FK → chat_rooms.id |
| user_id | UUID | FK → profiles.id |
| text | TEXT | Contenido del mensaje |
| created_at | TIMESTAMPTZ | Fecha del mensaje |

#### Tabla `locatario_events`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| creator_id | UUID | FK → profiles.id |
| title | TEXT | Título del evento |
| description | TEXT | Descripción |
| category | ENUM | Categoría del evento |
| event_date | TIMESTAMPTZ | Fecha del evento |
| address | TEXT | Dirección |
| price | NUMERIC (null) | Precio (null = gratis) |
| image_url | TEXT (null) | Imagen del evento |
| organizer_name | TEXT | Nombre del organizador |
| organizer_avatar | TEXT (null) | Avatar del organizador |
| created_at | TIMESTAMPTZ | Fecha de creación |

#### Tabla `token_wallets`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → profiles.id |
| balance | INTEGER | Saldo de tokens disponibles |
| updated_at | TIMESTAMPTZ | Última actualización |

#### Tabla `token_transactions`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| wallet_id | UUID | FK → token_wallets.id |
| amount | INTEGER | Cantidad de tokens (positivo/negativo) |
| type | TEXT | Tipo de transacción |
| description | TEXT (null) | Detalle de la transacción |
| created_at | TIMESTAMPTZ | Fecha |

#### Tabla `payment_orders`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → profiles.id |
| amount | NUMERIC | Monto en CLP |
| currency | TEXT | Moneda (CLP) |
| status | TEXT | Estado del pago |
| provider | TEXT | `mercadopago` \| `transbank` |
| external_id | TEXT (null) | ID externo del proveedor |
| created_at | TIMESTAMPTZ | Fecha |

#### Tabla `promotion_campaigns`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| creator_id | UUID | FK → profiles.id |
| title | TEXT | Nombre de la campaña |
| budget_tokens | INTEGER | Presupuesto en tokens |
| status | TEXT | Estado de la campaña |
| created_at | TIMESTAMPTZ | Fecha |

#### Tabla `coupons`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| code | TEXT | Código único del cupón |
| discount | NUMERIC | Descuento aplicado |
| used_by | UUID (null) | FK → profiles.id |
| used_at | TIMESTAMPTZ (null) | Fecha de uso |
| expires_at | TIMESTAMPTZ | Expiración |

#### Tabla `transactions`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → profiles.id |
| type | TEXT | Tipo de operación |
| amount | NUMERIC | Monto |
| status | TEXT | Estado |
| created_at | TIMESTAMPTZ | Fecha |

#### Tabla `reports`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| reporter_id | UUID | FK → profiles.id |
| reported_user_id | UUID (null) | FK → profiles.id |
| reason | TEXT | Motivo del reporte |
| status | TEXT | `pending` \| `resolved` \| `dismissed` |
| created_at | TIMESTAMPTZ | Fecha |

#### Tabla `qr_validations`
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | PK |
| coupon_id | UUID | FK → coupons.id |
| validated_by | UUID | FK → profiles.id |
| validated_at | TIMESTAMPTZ | Fecha de validación |

---

## 6. Contextos Globales del Frontend

| Contexto | Hook | Descripción |
|---|---|---|
| `AuthContext` | `useAuth()` | Estado global de autenticación, login, logout, registro, OAuth |
| `ChatContext` | `useChatContext()` | Salas de chat, mensajes, tiempo real, join/send/read |
| `NearbyPlacesContext` | `useNearbyPlacesContext()` | Lugares cercanos (Google Places), filtros, geolocalización |
| `LocatarioEventsContext` | `useLocatarioEvents()` | Eventos creados por locatarios, CRUD |

---

## 7. Variables de Entorno Necesarias

Las siguientes variables de entorno fueron identificadas directamente en el código fuente. **No se incluyen valores reales.**

| Variable | Visibilidad | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente | Clave anónima de Supabase |
| `NEXT_PUBLIC_BACKEND_URL` | Cliente | URL base del backend `eMeet_Backend_Supabase` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Cliente | Clave de Google Maps JavaScript + Places API |
| `NEXT_PUBLIC_PLACES_TIMEOUT_MS` | Cliente | Timeout en ms para llamadas a Places API (opcional) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor | Clave service role de Supabase (uso interno) |
| `BACKEND_FETCH_TIMEOUT_MS` | Solo servidor | Timeout para llamadas al backend desde Route Handlers |

> ⚠️ Las variables `NEXT_PUBLIC_*` son accesibles desde el navegador. Las demás solo deben usarse en el servidor.

---

## 8. Flujo de Datos

### Flujo de autenticación:
```
[Usuario] → /auth → [LoginForm]
→ fetchApi('/api/auth/login') → [eMeet_Backend_Supabase]
→ Recibe session (access_token + refresh_token)
→ supabase.auth.setSession(tokens)
→ syncUserData() → fetchApi('/api/profile') + '/api/events/liked' + '/api/events/saved'
→ AuthContext actualiza estado global
→ Redirect según rol (/admin, /locatario, /)
```

### Flujo del feed de lugares:
```
[NearbyPlacesContext] → navigator.geolocation → userLocation
→ useJsApiLoader (Google Maps JS API)
→ fetchNearby(bounds, placeTypes) → PlacesService → Google Places API
→ places[] → placeToEvent() (adaptador) → SwipeCard[]
→ [Usuario] swipe right/left → excludePlace / joinRoom
```

### Flujo del chat:
```
[Usuario] → /chat → [ChatContext]
→ fetchApi('/api/chat/rooms') → lista de salas
→ /chat/[roomId] → loadMessagesForRoom() → fetchApi('/api/chat/rooms/:id/messages')
→ Supabase Realtime (canal 'emeet-chat-realtime')
  → escucha INSERT en chat_messages
  → actualiza mensajes y sala en tiempo real
→ sendMessage() → fetchApi POST + update optimista
```

---

## 9. Integraciones Externas

| Integración | Tipo | Acceso | Descripción |
|---|---|---|---|
| **Supabase** | Backend as a Service | Frontend + Backend | Auth JWT, PostgreSQL, Realtime WebSocket, Storage |
| **Google Maps Platform** | API externa | Backend (`/places`) | Maps JavaScript API (frontend visual) + Places API proxied por backend |
| **Mercado Pago** | Pasarela de pago | Backend (`/monetization`) | Checkout + Webhook de confirmación |
| **Transbank WebPay Plus** | Pasarela de pago | Backend (`/monetization`) | Pagos con tarjeta en Chile |
| **Deezer API** | API de música | Frontend Route Handler (`/api/deezer`) | Proxy de música ambiental |
| **OAuth Google** | Proveedor de identidad | Frontend + Supabase Auth | Login con cuenta Google |
| **OAuth Apple** | Proveedor de identidad | Frontend + Supabase Auth | Login con Apple ID |

---

## 10. Diagrama Textual de Arquitectura (Mermaid)

```mermaid
flowchart TD
    U[Usuario / Navegador] -->|HTTPS| FE

    subgraph FE [eMeet_frontend - Next.js 14 - Vercel]
        direction TB
        MW[Middleware Next.js - Proteccion de rutas - Roles]
        APP[App Router - Feed - Chat - Perfil - Admin - Locatario]
        CTX[Contextos - Auth - Chat - NearbyPlaces - LocatarioEvents]
        RH[Route Handlers app/api/ - admin ServiceRole - deezer - keepalive - OAuth]
    end

    MW --> APP
    APP --> CTX
    APP --> RH

    CTX -->|fetchApi - Bearer JWT| BACK
    RH -->|Service Role Key| SA
    RH -->|HTTP proxy| DZ[Deezer API]

    subgraph BACK [eMeet_Backend_SupaBase - Express.js - Render]
        direction LR
        AUTH[/auth - login - register - logout - reset-pwd]
        PROF[/profile - GET - PATCH - avatar]
        EVT[/events - like - save - CRUD]
        CHAT[/chat - rooms - messages - join - read]
        PLC[/places - search-nearby - photo proxy]
        ADM[/admin - stats - reports - gestion]
        MON[/monetization - tokens - pagos - QR - coupons]
    end

    CTX -->|signIn - OAuth| SA
    CTX -->|WebSocket postgres_changes| RT

    subgraph SUP [Supabase - ksghpwonmnxmbhmfpaog]
        direction TB
        SA[Auth - JWT RS256 - OAuth Google/Apple]
        DB[(PostgreSQL - 14 tablas)]
        RT[Realtime - WebSocket]
        ST[Storage - avatars - event-images - event-videos]
    end

    BACK -->|Supabase JS Client| DB
    BACK -->|Supabase JS Client| SA
    BACK -->|SDK upload| ST
    DB -->|CDC triggers| RT

    PLC -->|HTTP| GM[Google Maps Platform - Places API - Photo Proxy]
    MON -->|SDK| MP[Mercado Pago - Checkout - Webhook]
    MON -->|HTTP| TB[Transbank WebPay Plus]
```

---

## 11. Información Confirmada

| Elemento | Estado | Detalle |
|---|---|---|
| Estructura interna de `eMeet_Backend_SupaBase` | ✅ Confirmado | Express.js con `src/routes/`, `src/middleware/`, `src/services/`, `src/config/`, `src/lib/`, `src/schemas/`, `src/utils/`, `src/types/`, `src/constants/` |
| ORM utilizado en el backend | ✅ Confirmado | Prisma 6.19 (en `dependencies`) + Supabase JS Client 2.56 |
| Esquema SQL — 14 tablas | ✅ Confirmado | Ver Sección 5 de este documento y [MER.md](./MER.md) |
| URL pública frontend | ✅ Confirmado | https://e-meet-frontend-nine.vercel.app/ |
| URL pública backend | ✅ Confirmado | https://emeet-backend-supabase-p0i6.onrender.com |
| CI/CD del backend | ✅ Confirmado | GitHub → Render, automático desde rama `main` |
| CI/CD del frontend | ✅ Confirmado | GitHub → Vercel, automático desde rama `main` |
| Tests del backend | ✅ Confirmado | Vitest 4.1 + Supertest: `auth.test.ts`, `auth.routes.test.ts`, `chatService.test.ts`, `http.test.ts` |
