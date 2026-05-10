# Recuperación de Contraseña - eMeet Backend

Flujo completo de recuperación de contraseña usando Supabase Auth.

---

## Flujo general

```
1. Usuario solicita restablecer contraseña
   POST /auth/forgot-password  { email }
   ↓
2. Supabase envía email con enlace de recuperación
   El enlace redirige a: FRONTEND_ORIGIN/auth/reset-password#access_token=...
   ↓
3. El frontend extrae el access_token de la URL y lo envía al backend
   POST /auth/reset-password  { token, newPassword }
   ↓
4. El backend verifica el token, valida la contraseña y la actualiza
   Respuesta 200 { message }
```

---

## Endpoints

### POST /auth/forgot-password

Solicita el envío de un email de recuperación de contraseña.

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuestas:**

| Código | Condición | Body |
|--------|-----------|------|
| 200 | Email válido (usuario exista o no) | `{ "message": "Si el email esta registrado..." }` |
| 400 | Email ausente | `{ "error": "El email es obligatorio." }` |
| 400 | Formato de email inválido | `{ "error": "El formato del email no es valido." }` |

**Consideración de seguridad:** El endpoint siempre devuelve el mismo mensaje 200 con independencia de si el email está registrado. Esto previene la enumeración de usuarios (email enumeration attack).

---

### POST /auth/reset-password

Actualiza la contraseña del usuario usando el token recibido por email.

**Body:**
```json
{
  "token": "<access_token del enlace de recuperación>",
  "newPassword": "NuevaPass123"
}
```

**Respuestas:**

| Código | Condición | Body |
|--------|-----------|------|
| 200 | Contraseña actualizada | `{ "message": "Contrasena actualizada exitosamente." }` |
| 400 | Token o contraseña ausentes | `{ "error": "El token y la nueva contrasena son obligatorios." }` |
| 400 | Contraseña < 8 caracteres | `{ "error": "La contrasena debe tener al menos 8 caracteres." }` |
| 400 | Sin letra mayúscula | `{ "error": "La contrasena debe contener al menos una letra mayuscula." }` |
| 400 | Sin letra minúscula | `{ "error": "La contrasena debe contener al menos una letra minuscula." }` |
| 400 | Sin número | `{ "error": "La contrasena debe contener al menos un numero." }` |
| 400 | Token inválido o expirado | `{ "error": "El token es invalido o ha expirado." }` |
| 500 | Error al actualizar en Supabase | `{ "error": "No se pudo actualizar la contrasena." }` |

---

## Reglas de fortaleza de contraseña

La nueva contraseña debe cumplir todos los requisitos simultáneamente:

- Mínimo **8 caracteres**
- Al menos una **letra mayúscula** (A–Z)
- Al menos una **letra minúscula** (a–z)
- Al menos un **número** (0–9)

---

## Implementación técnica

### forgot-password

Llama a `supabase.auth.resetPasswordForEmail(email, { redirectTo })` con el cliente anónimo. El `redirectTo` apunta a `FRONTEND_ORIGIN/auth/reset-password` para que Supabase incluya esa URL en el enlace del email.

El error de Supabase se ignora intencionalmente para no filtrar información sobre la existencia del usuario.

### reset-password

1. Verifica el token con `createAnonClient(token).auth.getUser()` — si el JWT no es válido o está expirado, devuelve 400.
2. Actualiza la contraseña usando `createServiceRoleClient().auth.admin.updateUserById(userId, { password })` — el service role client tiene acceso de administrador y no está sujeto a RLS.

---

## Configuración de Supabase requerida

En el dashboard de Supabase → **Authentication → Email Templates → Reset Password**, verificar que:
- El template esté habilitado.
- La URL de redirección del proyecto incluya `FRONTEND_ORIGIN/auth/reset-password` en la lista de Redirect URLs permitidas (**Authentication → URL Configuration**).

---

## Variables de entorno relevantes

| Variable | Uso |
|----------|-----|
| `FRONTEND_ORIGIN` | URL base del frontend (ej. `http://localhost:3000`). Se usa para construir el `redirectTo` del email. |
| `SUPABASE_ANON_KEY` | Usada para verificar el token de recuperación. |
| `SUPABASE_SERVICE_ROLE_KEY` | Usada para actualizar la contraseña sin restricciones de RLS. |

---

## Tests

Los tests están en `src/routes/auth.routes.test.ts` y cubren:

**forgot-password:**
- Email ausente → 400
- Email con formato inválido → 400
- Email válido → 200
- Email no registrado → 200 (mismo mensaje, sin filtrar)

**reset-password:**
- Parámetros ausentes → 400
- Contraseña corta (< 8) → 400
- Sin mayúscula → 400
- Sin minúscula → 400
- Sin número → 400
- Token expirado/inválido → 400
- Supabase no devuelve usuario → 400
- Éxito → 200
- Error de actualización en Supabase → 500

Ejecutar tests:
```bash
npm run test
```
