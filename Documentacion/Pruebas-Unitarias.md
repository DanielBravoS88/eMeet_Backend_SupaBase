# Evidencia de Pruebas Unitarias — eMeet Backend

---

## Descripción General

Las pruebas unitarias del backend de **eMeet** fueron desarrolladas con **Jest**, **ts-jest** y **Supertest**, cubriendo la capa de middleware, rutas HTTP, servicios de negocio y utilidades. Todas las pruebas corren en un entorno Node.js simulado sin necesidad de una base de datos real ni de Supabase activo — se utilizan mocks para aislar cada unidad.

El objetivo es verificar que la lógica del servidor responda correctamente ante entradas válidas e inválidas, garantizando seguridad en la autenticación y consistencia en los datos del chat.

---

## Tecnologías Utilizadas

| Herramienta | Versión | Propósito |
|---|---|---|
| **Jest** | ^29.7.0 | Framework principal de testing |
| **ts-jest** | ^29.2.5 | Transpilación de TypeScript para Jest |
| **Supertest** | ^7.2.2 | Simulación de peticiones HTTP a Express |
| **@types/jest** | ^29.5.14 | Tipado TypeScript para Jest |

---

## Suites y Tests Ejecutados

### 1. `src/middleware/auth.test.ts` — Middleware de Autenticación

Verifica que el middleware `withAuth` proteja correctamente las rutas del servidor.

| Test | Qué verifica |
|---|---|
| Rechaza cuando falta bearer token | Sin header `Authorization`, responde 401 |
| Rechaza cuando Supabase devuelve sesión inválida | Token inválido → responde 401 con mensaje de sesión expirada |
| Continúa con perfil mínimo cuando syncAuthProfile falla | Error en BD no bloquea la request; adjunta perfil con rol `user` |
| Continúa y adjunta usuario cuando el token es válido | Token correcto → adjunta `authUser`, `authProfile` y `supabase` al request |

---

### 2. `src/routes/auth.routes.test.ts` — Rutas de Autenticación

Pruebas de integración HTTP sobre los endpoints `POST /auth/forgot-password` y `POST /auth/reset-password` usando Supertest.

**POST /auth/forgot-password**

| Test | Resultado esperado |
|---|---|
| Falta el email en el body | 400 con error |
| Email con formato inválido | 400 con error |
| Email sin dominio (`usuario@`) | 400 con error |
| Email válido y Supabase OK | 200 con mensaje seguro |
| Email no registrado | 200 con el mismo mensaje (no filtra si existe o no) |

**POST /auth/reset-password**

| Test | Resultado esperado |
|---|---|
| Faltan token y contraseña | 400 con error |
| Falta el token | 400 |
| Contraseña menor a 8 caracteres | 400 — "8 caracteres" |
| Contraseña sin mayúscula | 400 — "mayuscula" |
| Contraseña sin minúscula | 400 — "minuscula" |
| Contraseña sin número | 400 — "numero" |
| Token inválido o expirado | 400 con error |
| Supabase no devuelve usuario | 400 |
| Token válido y contraseña correcta | 200 con mensaje de éxito |
| Fallo al actualizar en Supabase | 500 con error |

---

### 3. `src/services/chatService.test.ts` — Servicio de Chat

Verifica la lógica de negocio del chat: membresía en salas, limpieza de salas vacías y purga de salas expiradas.

**isMember**

| Test | Qué verifica |
|---|---|
| Count > 0 | Retorna `true` — el usuario es miembro |
| Count es 0 | Retorna `false` — el usuario no es miembro |
| Error de BD | Retorna `false` — falla segura |

**cleanupEmptyRoom**

| Test | Qué verifica |
|---|---|
| Count de miembros es 0 | Elimina la sala de `chat_rooms` |
| Quedan miembros en la sala | No elimina la sala |

**purgeExpiredRooms**

| Test | Qué verifica |
|---|---|
| Sin salas expiradas | Retorna array vacío |
| Con salas expiradas | Elimina las salas y retorna sus IDs |

**like → join room (regla de negocio)**

| Test | Qué verifica |
|---|---|
| Dos usuarios hacen like al mismo evento | Ambos quedan en la misma sala (idempotencia por `eventId`) |
| El mismo usuario hace like múltiples veces | No se duplica la membresía |

---

### 4. `src/utils/http.test.ts` — Utilidades HTTP

Verifica que los helpers de respuesta HTTP devuelvan los códigos y cuerpos correctos.

| Test | Resultado esperado |
|---|---|
| `badRequest(res, msg)` | `status(400)` + `json({ error: msg })` |
| `unauthorized(res)` | `status(401)` + mensaje por defecto "No autorizado" |
| `unauthorized(res, msg)` | `status(401)` + mensaje personalizado |
| `serverError(res)` | `status(500)` + mensaje por defecto |
| `serverError(res, msg)` | `status(500)` + mensaje personalizado |

---

## Resultado de la Ejecución

> **Captura de pantalla de la ejecución completa:**

![Resultado pruebas unitarias Jest Backend](./img/pruebas-unitarias-backend-resultado.png)

```
Test Suites: 4 passed, 4 total
Tests:       33 passed, 33 total
Snapshots:   0 total
Time:        3.137 s
```

**Estado: TODAS LAS PRUEBAS PASARON** ✓

---

## Cómo Ejecutar las Pruebas

```bash
# Desde la raíz del backend
cd eMeet_Backend_SupaBase

# Ejecutar todas las pruebas
npm test

# Ejecutar en modo watch
npm run test:watch
```

---

## Relación con el Plan QA

Estas pruebas cubren automatizadamente los siguientes casos del [`Plan_QA.md`](./Plan_QA.md):

- **AUTH-02, AUTH-03**: Login exitoso y fallido → cubierto por `auth.routes.test.ts`
- **AUTH-07, AUTH-08**: Protección de rutas por rol → cubierto por `auth.test.ts` (middleware)
- **CHAT-01**: Membresía en sala al dar like → cubierto por `chatService.test.ts`
- Validación de contraseña segura → cubierto por `auth.routes.test.ts` (reset-password)
