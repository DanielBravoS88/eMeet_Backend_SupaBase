# Infraestructura y ambiente cloud

## Descripción general
El proyecto eMeet utiliza infraestructura en la nube distribuida en tres plataformas principales.

---

## Frontend
| Parámetro | Valor |
|-----------|-------|
| Plataforma | Vercel |
| URL producción | https://e-meet-frontend-nine.vercel.app/ |
| Framework | Next.js / TypeScript / Tailwind CSS |
| Despliegue automático | Sí (push a `main`) |

---

## Backend
| Parámetro | Valor |
|-----------|-------|
| Plataforma | Render |
| Framework | Node.js / Express / TypeScript |
| ORM | Prisma |
| Despliegue automático | Sí (push a `main`) |

---

## Base de datos
| Parámetro | Valor |
|-----------|-------|
| Plataforma | Supabase |
| Motor | PostgreSQL |
| Funciones adicionales | Auth, Storage (avatares), Realtime |

---

## Stack tecnológico desplegado

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5
- **Lenguaje**: TypeScript
- **ORM**: Prisma
- **Auth**: Supabase Auth (JWT)
- **Seguridad HTTP**: Helmet, CORS con whitelist

### Base de datos
- **Motor**: PostgreSQL (Supabase)
- **Migraciones**: SQL en `/supabase/`
- **Schema**: definido en `prisma/schema.prisma`

---

## Ambiente de pruebas
- Se utiliza el entorno cloud de Supabase para validación funcional del sistema.
- Se recomienda mantener un proyecto Supabase separado para pruebas (staging), replicando la estructura de producción con datos de prueba.
- Las variables de entorno deben apuntar al proyecto de staging para no afectar datos reales.

### Variables relevantes para staging
```env
SUPABASE_URL=<url-del-proyecto-de-pruebas>
SUPABASE_ANON_KEY=<anon-key-del-proyecto-de-pruebas>
SUPABASE_SERVICE_ROLE_KEY=<service-role-del-proyecto-de-pruebas>
```

---

## Diagrama de arquitectura de despliegue

```
[Usuario]
    |
    ▼
[Vercel - Frontend Next.js]
    |
    | HTTPS / REST API
    ▼
[Render - Backend Express/Node.js]
    |
    | PostgreSQL (Prisma)   | Supabase Auth   | Supabase Storage
    ▼                       ▼                 ▼
[Supabase - PostgreSQL + Auth + Storage + Realtime]
```
