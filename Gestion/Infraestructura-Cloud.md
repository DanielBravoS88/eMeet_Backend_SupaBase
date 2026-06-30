# Infraestructura Cloud — Proyecto eMeet

> Este documento describe la infraestructura cloud confirmada del proyecto eMeet según el Informe EP2 y el análisis de ambos repositorios (`eMeet_frontend` y `eMeet_Backend_SupaBase`).

---

## 1. Resumen del Stack de Infraestructura

| Componente | Plataforma | URL | Estado |
|---|---|---|---|
| **Frontend** (`eMeet_frontend`) | Vercel | https://e-meet-frontend-nine.vercel.app/ | ✅ Desplegado |
| **Backend** (`eMeet_Backend_SupaBase`) | Render | https://emeet-backend-supabase-p0i6.onrender.com | ✅ Desplegado |
| **Base de datos** | Supabase PostgreSQL | ksghpwonmnxmbhmfpaog | ✅ Configurado |
| **Autenticación** | Supabase Auth | ksghpwonmnxmbhmfpaog | ✅ Configurado |
| **Tiempo real** | Supabase Realtime | ksghpwonmnxmbhmfpaog | ✅ Configurado |
| **Almacenamiento de archivos** | Supabase Storage | ksghpwonmnxmbhmfpaog | ✅ Configurado |
| **Servicio de mapas** | Google Maps Platform | — | ✅ Integrado en backend (`/places`) |
| **Pagos (Chile)** | Mercado Pago + Transbank | — | ✅ Integrado en backend (`/monetization`) |
| **Proxy musical** | Deezer API | — | ✅ Integrado vía Route Handler frontend |

---

## 2. Frontend — `eMeet_frontend`

### Plataforma: Vercel

**URL de producción**: https://e-meet-frontend-nine.vercel.app/

El repositorio `eMeet_frontend` usa Next.js 14 con integración nativa en Vercel. CI/CD automático: cada push a `main` genera un deploy en producción. Los Pull Requests generan Preview URLs automáticas.

### Proceso de despliegue en Vercel:

1. Conectar el repositorio a Vercel.
2. Configurar las variables de entorno en Vercel (Settings → Environment Variables).
3. Seleccionar la rama `main` como rama de producción.
4. Vercel detecta automáticamente Next.js y ejecuta `npm run build`.
5. Cada Push a `main` dispara un despliegue automático (CI/CD: GitHub → Vercel).

---

## 3. Backend — `eMeet_Backend_SupaBase`

### Plataforma: Render

**URL de producción**: https://emeet-backend-supabase-p0i6.onrender.com

El backend es una API REST en **Express.js + Node 20 + TypeScript**, desplegado en Render con CI/CD automático desde GitHub (`main` branch).

### Stack del backend:

| Elemento | Tecnología |
|---|---|
| Framework | Express.js 4 |
| Runtime | Node.js 20 |
| Lenguaje | TypeScript 5.6 |
| ORM / DB client | Prisma + Supabase JS Client |
| Seguridad | Helmet, CORS dinámico, JWT RS256 |
| Logging | Morgan |
| Pagos | Mercado Pago y Transbank WebPay Plus (vía HTTP/REST directo, sin SDK) |
| Testing | Jest + ts-jest + Supertest |

### Grupos de rutas confirmados (src/app.ts):

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

### Proceso de despliegue en Render:

1. Conectar el repositorio a Render (Web Service).
2. Configurar el entorno como Node.js 20, comando de build: `npm run build`, start: `npm start`.
3. Variables de entorno configuradas en el dashboard de Render.
4. Cada push a `main` dispara un redespliegue automático (CI/CD: GitHub → Render).

---

## 4. Supabase — Plataforma de Datos

**URL del proyecto**: https://supabase.com/dashboard/project/ksghpwonmnxmbhmfpaog

| Servicio | Estado | Detalle |
|---|---|---|
| **PostgreSQL** | ✅ Activo | 14 tablas: profiles, user_events, chat_rooms, room_members, chat_messages, locatario_events, token_wallets, token_transactions, payment_orders, promotion_campaigns, coupons, transactions, reports, qr_validations |
| **Auth** | ✅ Activo | JWT RS256, OAuth Google, OAuth Apple |
| **Realtime** | ✅ Activo | WebSocket `postgres_changes` para mensajes de chat |
| **Storage** | ✅ Activo | Buckets: `avatars`, `event-images`, `event-videos` |
| **Edge Functions** | ❌ No utilizado | El backend corre en Render como servidor Express |

---

## 5. Google Maps Platform

| Servicio | Uso | Ubicación |
|---|---|---|
| **Maps JavaScript API** | Mapa interactivo (`BellavistaMap`, `LocationPickerMap`) | Frontend (cliente) |
| **Places API** | Búsqueda de lugares cercanos, proxied | Backend Express (`/places`) |

> Las consultas a Google Places API se realizan desde el backend Express (`/places`), protegiendo la clave y controlando el consumo de cuota.

---

## 6. Servicios de Pago

### Mercado Pago

| Elemento | Detalle |
|---|---|
| Integración | SDK oficial de Mercado Pago en backend Express |
| Flujo | Checkout + Webhook de confirmación |
| Ruta | `/monetization` |

### Transbank

| Elemento | Detalle |
|---|---|
| Integración | WebPay Plus en backend Express |
| Ruta | `/monetization` |

---

## 7. Variables de Entorno por Ambiente

### Frontend — `.env.local` (desarrollo) / Vercel (producción)

| Variable | Descripción | Visibilidad |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Pública (cliente) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Pública (cliente) |
| `NEXT_PUBLIC_BACKEND_URL` | URL del backend REST en Render | Pública (cliente) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Clave de Google Maps (solo mapa visual) | Pública (cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role para Route Handlers admin | **Solo servidor** |

### Backend — variables en Render (`src/config/env.ts`)

| Variable | Descripción |
|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role para operaciones admin |
| `SUPABASE_ANON_KEY` | Clave anónima para operaciones de cliente |
| `FRONTEND_ORIGIN` | Origen(s) permitidos por CORS (separados por coma) |
| `BACKEND_PUBLIC_URL` | URL pública del backend (usada en webhooks y logs) |
| `MERCADO_PAGO_ACCESS_TOKEN` | Credencial de Mercado Pago |
| `TRANSBANK_ENV` | `integration` o `production` |
| `TRANSBANK_COMMERCE_CODE` | Código de comercio de Transbank WebPay |
| `TRANSBANK_API_KEY` | Credencial de Transbank WebPay |
| `GOOGLE_MAPS_API_KEY` | Clave de Google Maps para Places API |
| `PORT` | Puerto del servidor (4000 en desarrollo) |

> ⚠️ Ninguna de estas variables debe subirse al repositorio. Usar `.env` en desarrollo y el dashboard de Render en producción.

---

## 8. CI/CD — Flujo de Despliegue Automático

```
GitHub (push a main)
    │
    ├──▶ Vercel (frontend)
    │        └─ npm run build → Deploy en https://e-meet-frontend-nine.vercel.app/
    │
    └──▶ Render (backend)
             └─ npm run build (tsc) → node dist/server.js
                Deploy en https://emeet-backend-supabase-p0i6.onrender.com
```

### Verificación post-despliegue

- [ ] `GET /health` responde `{ ok: true }`.
- [ ] Login y registro con email funcionan.
- [ ] El feed carga lugares (Google Maps + `/places`).
- [ ] Chat en tiempo real funciona (Supabase Realtime).
- [ ] Rutas protegidas redirigen correctamente según rol.
- [ ] Pagos con Mercado Pago / Transbank responden (`/monetization`).
- [ ] Variables de entorno configuradas en Vercel y Render.

---

## 9. Evidencia Requerida para Entrega Académica

| Evidencia | Descripción |
|---|---|
| Captura del dashboard de Supabase | Mostrar las 14 tablas con datos reales |
| Captura del proyecto en Vercel | URL de producción del frontend desplegado |
| Captura del servicio en Render | Backend desplegado con logs de ejecución |
| URL de la aplicación desplegada | https://e-meet-frontend-nine.vercel.app/ |
| Variables de entorno configuradas | Captura de la configuración (sin mostrar los valores) |
| Resultado de `GET /health` | Respuesta JSON confirmando el backend activo |
