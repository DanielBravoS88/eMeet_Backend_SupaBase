# API Reference — eMeet Backend

Base URL: `https://<render-app>.onrender.com`

Todos los endpoints protegidos requieren header:
```
Authorization: Bearer <supabase-jwt>
```

---

## Auth (`/auth`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| POST | `/auth/register` | No | Registrar nuevo usuario |
| POST | `/auth/login` | No | Iniciar sesión |
| POST | `/auth/logout` | Sí | Cerrar sesión |
| GET | `/auth/session` | Sí | Obtener sesión activa |

---

## Perfil (`/profile`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| GET | `/profile` | Sí | Obtener perfil propio |
| PATCH | `/profile` | Sí | Actualizar perfil |
| POST | `/profile/avatar` | Sí | Subir avatar |

---

## Eventos (`/events`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| GET | `/events/liked` | Sí | Eventos con like |
| GET | `/events/saved` | Sí | Eventos guardados |
| POST | `/events/like` | Sí | Dar like a evento |
| POST | `/events/save` | Sí | Guardar evento |
| DELETE | `/events/like/:id` | Sí | Quitar like |
| DELETE | `/events/save/:id` | Sí | Quitar guardado |
| GET | `/events/locatario` | Sí | Mis eventos (locatario) |
| POST | `/events/locatario` | Sí | Crear evento (locatario) |
| DELETE | `/events/locatario/:id` | Sí | Eliminar evento (locatario) |

---

## Chat (`/chat`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| GET | `/chat/rooms` | Sí | Listar salas del usuario |
| POST | `/chat/rooms/:id/join` | Sí | Unirse a sala |
| GET | `/chat/rooms/:id/messages` | Sí | Obtener mensajes |
| POST | `/chat/rooms/:id/messages` | Sí | Enviar mensaje |
| POST | `/chat/rooms/:id/read` | Sí | Marcar sala como leída |
| GET | `/chat/rooms/:id/unread` | Sí | Mensajes no leídos de sala |
| GET | `/chat/unread` | Sí | Total no leídos globales |

---

## Lugares (`/places`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| GET | `/places/search` | Sí | Buscar lugares (Google Places) |
| GET | `/places/details/:id` | Sí | Detalle de un lugar |

---

## Administración (`/admin`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| GET | `/admin/reports` | Sí (admin) | Listar reportes |
| PATCH | `/admin/reports/:id` | Sí (admin) | Resolver/rechazar reporte |
| GET | `/admin/kpis` | Sí (admin) | KPIs del sistema |

---

## Monetización (`/monetization`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| GET | `/monetization/tokens` | Sí | Saldo de tokens |
| POST | `/monetization/tokens/purchase` | Sí | Comprar pack de tokens |
| POST | `/monetization/promotions` | Sí | Crear promoción para evento |
| GET | `/monetization/transactions` | Sí | Historial de transacciones |

---

## Estado de salud (`/health`)

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| GET | `/health` | No | Verificar que el servicio está activo |
