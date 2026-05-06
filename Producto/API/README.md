# API REST — eMeet Backend

## Base URL

```
https://<tu-servicio>.onrender.com
```

> Para desarrollo local: `http://localhost:4000`

---

## Autenticación

Los endpoints protegidos requieren el header:

```http
Authorization: Bearer <access_token>
```

El `access_token` se obtiene al iniciar sesión con `/auth/login`.  
El backend valida el token usando `supabase.auth.getUser()`.

---

## Endpoints

### Estado del servicio

| Método | Ruta      | Descripción              | Auth |
|--------|-----------|--------------------------|------|
| GET    | `/health` | Health check del backend | No   |

---

### Autenticación — `/auth`

| Método | Ruta             | Descripción                    | Auth |
|--------|------------------|--------------------------------|------|
| POST   | `/auth/register` | Registro de nuevo usuario      | No   |
| POST   | `/auth/login`    | Inicio de sesión               | No   |
| POST   | `/auth/logout`   | Cierre de sesión               | Sí   |
| GET    | `/auth/session`  | Información de la sesión actual| Sí   |

---

### Perfil — `/profile`

| Método | Ruta              | Descripción                       | Auth |
|--------|-------------------|-----------------------------------|------|
| GET    | `/profile`        | Obtener perfil del usuario        | Sí   |
| PATCH  | `/profile`        | Actualizar datos del perfil       | Sí   |
| POST   | `/profile/avatar` | Subir foto de perfil              | Sí   |

---

### Eventos — `/events`

| Método | Ruta                       | Descripción                           | Auth |
|--------|----------------------------|---------------------------------------|------|
| POST   | `/events/like`             | Dar like a un evento                  | Sí   |
| POST   | `/events/save`             | Guardar un evento                     | Sí   |
| DELETE | `/events/like/:id`         | Quitar like de un evento              | Sí   |
| DELETE | `/events/save/:id`         | Quitar evento guardado                | Sí   |
| GET    | `/events/liked`            | Listar eventos con like               | Sí   |
| GET    | `/events/saved`            | Listar eventos guardados              | Sí   |
| GET    | `/events/locatario`        | Listar eventos del locatario          | Sí   |
| POST   | `/events/locatario`        | Crear evento (rol locatario)          | Sí   |
| DELETE | `/events/locatario/:id`    | Eliminar evento propio                | Sí   |

---

### Chat — `/chat`

| Método | Ruta                          | Descripción                          | Auth |
|--------|-------------------------------|--------------------------------------|------|
| GET    | `/chat/rooms`                 | Listar salas del usuario             | Sí   |
| POST   | `/chat/rooms/:id/join`        | Unirse a una sala                    | Sí   |
| GET    | `/chat/rooms/:id/messages`    | Obtener mensajes de una sala         | Sí   |
| POST   | `/chat/rooms/:id/messages`    | Enviar mensaje a una sala            | Sí   |
| POST   | `/chat/rooms/:id/read`        | Marcar mensajes como leídos          | Sí   |
| GET    | `/chat/rooms/:id/unread`      | Contar mensajes no leídos            | Sí   |
| GET    | `/chat/unread`                | Total de mensajes no leídos          | Sí   |

---

### Lugares — `/places`

| Método | Ruta           | Descripción                             | Auth |
|--------|----------------|-----------------------------------------|------|
| GET    | `/places`      | Autocompletar dirección (Google Maps)   | Sí   |

---

### Administración — `/admin`

> Requiere rol `admin`.

| Método | Ruta                   | Descripción                              | Auth |
|--------|------------------------|------------------------------------------|------|
| GET    | `/admin/reports`       | Listar reportes de moderación            | Sí (admin) |
| PATCH  | `/admin/reports/:id`   | Resolver o desestimar un reporte         | Sí (admin) |
| GET    | `/admin/kpis`          | Panel de KPIs (transacciones, ingresos)  | Sí (admin) |

---

### Monetización — `/monetization`

| Método | Ruta                          | Descripción                           | Auth |
|--------|-------------------------------|---------------------------------------|------|
| POST   | `/monetization/ticket`        | Comprar ticket para un evento         | Sí   |
| POST   | `/monetization/subscription`  | Suscribirse a plan                    | Sí   |
| GET    | `/monetization/transactions`  | Historial de transacciones            | Sí   |

---

## Respuestas estándar

### Éxito
```json
{
  "data": { ... }
}
```

### Error
```json
{
  "error": "Mensaje descriptivo del error"
}
```

### Códigos HTTP comunes

| Código | Significado                    |
|--------|--------------------------------|
| 200    | OK                             |
| 201    | Creado                         |
| 400    | Solicitud inválida             |
| 401    | No autenticado                 |
| 403    | Sin permisos                   |
| 404    | No encontrado                  |
| 500    | Error interno del servidor     |
