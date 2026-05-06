# Infraestructura y Ambiente Cloud — eMeet Backend

## Componentes del stack en producción

| Servicio       | Plataforma    | Función                                          |
|----------------|---------------|--------------------------------------------------|
| API REST       | Render        | Hospedaje del backend Node.js/Express            |
| Base de datos  | Supabase      | PostgreSQL gestionado + Auth + Storage           |
| Frontend       | Vercel        | Hospedaje del frontend Next.js                   |

---

## Backend — Render

- **Plataforma:** [Render](https://render.com)
- **Tipo de servicio:** Web Service
- **Runtime:** Node.js
- **Comando de build:** `npm run build`
- **Comando de inicio:** `npm run start`
- **Variables de entorno configuradas en Render:**
  - `PORT`
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `FRONTEND_ORIGIN`

---

## Base de datos — Supabase

- **Plataforma:** [Supabase](https://supabase.com)
- **Motor:** PostgreSQL (gestionado)
- **Características utilizadas:**
  - Auth (email/password)
  - Storage (bucket `avatars` para fotos de perfil)
  - Realtime (tablas `chat_messages` y `room_members`)
  - SQL Editor para migraciones

---

## Frontend — Vercel

- **Plataforma:** [Vercel](https://vercel.com)
- **URL producción:** https://e-meet-frontend-nine.vercel.app/
- **Framework:** Next.js (App Router)
- **Variables de entorno:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

---

## Ambiente de pruebas

Actualmente el equipo utiliza:

- **Entorno local** con variables en `.env` (ver `.env.example` en el repositorio).
- **Proyecto Supabase de desarrollo** (separado del proyecto de producción).
- Las pruebas de integración y manuales se realizan apuntando al entorno local o al proyecto de pruebas de Supabase.

### Recomendación
Se recomienda mantener dos proyectos en Supabase:
- `emeet-prod` → producción
- `emeet-dev` → pruebas / staging

Esto permite validar migraciones antes de aplicarlas en producción.

---

## CORS — Orígenes permitidos

El backend tiene configurado CORS restrictivo con:
- Lista blanca de dominios explícitos del frontend.
- Soporte dinámico para subdominios `*.vercel.app` (preview deployments).
