# Infraestructura Cloud — eMeet

## Stack de despliegue

| Componente | Plataforma | URL / Referencia |
|------------|-----------|-----------------|
| Frontend | Vercel | https://e-meet-frontend-nine.vercel.app/ |
| Backend | Render | API REST (ver README) |
| Base de datos | Supabase | PostgreSQL gestionado |
| Autenticación | Supabase Auth | Email/Password |
| Storage | Supabase Storage | Bucket `avatars` |

## Variables de entorno del backend

```env
SUPABASE_URL=<url-del-proyecto-supabase>
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
DATABASE_URL=<postgresql-connection-string>
PORT=3000
```

## CORS

El backend acepta solicitudes desde:
- `http://localhost:3000` (desarrollo local)
- `https://e-meet-frontend-nine.vercel.app` (producción)
- Subdominios `*.vercel.app` (previews de PR)

## Ambiente de pruebas recomendado

1. Clonar proyecto y crear `.env` desde `.env.example`.
2. Ejecutar migraciones SQL en Supabase (ver `Producto/Base-de-Datos/Script-BD.sql`).
3. Cargar datos de prueba (`Producto/Base-de-Datos/Datos-Prueba.sql`).
4. Correr servidor local: `npm run dev`.
