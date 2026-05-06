# eMeet Backend

Backend API para eMeet usando Express + TypeScript + Supabase.

## Ejecutar local

1. Copia `.env.example` a `.env` y completa variables.
2. Instala dependencias:

```bash
npm install
```

3. Modo desarrollo:

```bash
npm run dev
```

4. Build producción:

```bash
npm run build
npm run start
```

## Variables de entorno

```env
PORT=4000
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
FRONTEND_ORIGIN=http://localhost:3000
```

## Autenticación

- Endpoints protegidos requieren header:

```http
Authorization: Bearer <access_token>
```

- El backend valida el token con `supabase.auth.getUser()`.

## Endpoints disponibles

### Auth
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `GET /auth/session`

### Perfil
- `GET /profile`
- `PATCH /profile`
- `POST /profile/avatar`

### Eventos
- `POST /events/like`
- `POST /events/save`
- `DELETE /events/like/:id`
- `DELETE /events/save/:id`
- `GET /events/liked`
- `GET /events/saved`
- `GET /events/locatario`
- `POST /events/locatario`
- `DELETE /events/locatario/:id`

### Chat
- `GET /chat/rooms`
- `POST /chat/rooms/:id/join`
- `GET /chat/rooms/:id/messages`
- `POST /chat/rooms/:id/messages`
- `POST /chat/rooms/:id/read`
- `GET /chat/rooms/:id/unread`
- `GET /chat/unread`

## Estado de salud
- `GET /health`

---

## Estructura de entrega académica

| Carpeta | Descripción |
|---------|-------------|
| [Documentacion/](Documentacion/README.md) | Arquitectura, base de datos, carta Gantt |
| [Producto/](Producto/README.md) | API reference, scripts SQL, datos de prueba |
| [Gestion/](Gestion/README.md) | Integrantes, estrategia de ramas, infraestructura cloud, backup BD |

**Repositorios del proyecto:**
- Frontend: https://github.com/DanielBravoS88/eMeet_frontend
- Backend: https://github.com/DanielBravoS88/eMeet_Backend_SupaBase

**Despliegues:**
- Frontend: https://e-meet-frontend-nine.vercel.app/
- Backend: Render (API REST)
- Base de datos: Supabase (PostgreSQL)
