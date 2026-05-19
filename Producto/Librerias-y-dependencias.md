# Librerías y Dependencias — eMeet Backend

> Análisis basado en el archivo `package.json` del repositorio `eMeet_Backend_SupaBase`.

---

## 1. Framework Principal

| Librería | Versión | Rol |
|---|---|---|
| **express** | ^4.21.2 | Framework HTTP minimalista para API REST en Node.js |

### Decisión técnica
Express.js fue elegido por su madurez, ecosistema amplio y flexibilidad para definir middlewares y rutas de forma granular. El servidor escucha en el puerto 4000 (desarrollo) y en el puerto configurado por variable de entorno en producción (Render).

---

## 2. Lenguaje y Runtime

| Herramienta | Versión | Rol |
|---|---|---|
| **Node.js** | 20 | Runtime del servidor (versión de producción en Render) |
| **TypeScript** | ^5.6.3 | Tipado estático estricto (`strict: true`) |
| **tsx** | ^4.19.3 | Ejecutor TypeScript para desarrollo con hot reload (`npm run dev`) |

---

## 3. Base de Datos y ORM

| Librería | Versión | Rol |
|---|---|---|
| **@prisma/client** | ^6.19.0 | ORM para operaciones relacionales tipadas sobre Supabase PostgreSQL |
| **prisma** | ^6.19.0 | CLI de Prisma (migrations, generate, studio) |
| **@supabase/supabase-js** | ^2.56.0 | Cliente JavaScript de Supabase (Auth, RPC, Storage, Realtime desde el backend) |

### Uso en el proyecto
- **Prisma**: operaciones de lectura/escritura tipadas sobre las 14 tablas de Supabase PostgreSQL.
- **Supabase JS Client**: se usa para Auth admin (`auth.admin.listUsers()`), Storage (upload de avatares e imágenes de eventos) y RPC en PostgreSQL.
- Ambas librerías coexisten: Prisma para queries complejas y relacionales; Supabase JS para operaciones auth y storage nativas de Supabase.

### Variables de entorno requeridas
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
```

---

## 4. Seguridad y Middleware HTTP

| Librería | Versión | Rol |
|---|---|---|
| **helmet** | ^8.0.0 | Configura headers HTTP de seguridad (CSP, HSTS, X-Frame-Options, etc.) |
| **cors** | ^2.8.5 | Configura CORS dinámico: permite `FRONTEND_ORIGIN`, localhost y `*.vercel.app` |
| **morgan** | ^1.10.0 | Logger de requests HTTP (método, ruta, status, tiempo de respuesta) |

### Uso en el proyecto
Los tres middlewares se configuran globalmente en `src/app.ts` y se aplican a todas las rutas. El CORS usa una función dinámica para aceptar múltiples orígenes separados por coma (`FRONTEND_ORIGIN`).

---

## 5. Autenticación

| Librería | Versión | Rol |
|---|---|---|
| **jsonwebtoken** (via @supabase/supabase-js) | — | Verificación de tokens JWT RS256 emitidos por Supabase Auth |

La verificación JWT se realiza en `src/middleware/auth.ts` usando el cliente Supabase con `SUPABASE_SERVICE_ROLE_KEY`. El token se extrae del header `Authorization: Bearer <token>` y se valida con `supabase.auth.getUser(token)`.

---

## 6. Pagos

| Librería | Versión | Rol |
|---|---|---|
| **mercadopago** | (SDK oficial) | Integración con Mercado Pago: Checkout + Webhook de confirmación |
| **transbank-sdk** | (SDK oficial) | Integración con Transbank WebPay Plus |

### Uso en el proyecto
Ambas librerías se usan en `src/routes/monetization.routes.ts` para procesar pagos en Chile. Mercado Pago cubre el flujo de pago online con checkout y webhook de confirmación. Transbank WebPay Plus cubre pagos con tarjeta de débito/crédito.

### Variables de entorno requeridas
```
MERCADOPAGO_ACCESS_TOKEN=
TRANSBANK_API_KEY=
```

---

## 7. Google Maps

| Librería | Versión | Rol |
|---|---|---|
| (HTTP nativo / axios) | — | El backend proxea llamadas a Google Maps Places API desde `/places` |

Las consultas a Google Maps Places API se realizan desde `src/services/placesService.ts` usando llamadas HTTP directas, protegiendo la clave del cliente.

### Variable de entorno requerida
```
GOOGLE_MAPS_API_KEY=
```

---

## 8. Validación de Datos

| Librería | Versión | Rol |
|---|---|---|
| **zod** | (via schemas) | Validación de schemas en `src/schemas/monetization.schema.ts` |

---

## 9. Testing

| Librería | Versión | Rol |
|---|---|---|
| **vitest** | ^4.1.0 | Framework de testing unitario e integración (compatible con TypeScript) |
| **supertest** | (devDependency) | Testing de endpoints HTTP de Express sin levantar el servidor real |

### Tests existentes
| Archivo | Tipo |
|---|---|
| `src/middleware/auth.test.ts` | Unitario |
| `src/routes/auth.routes.test.ts` | Integración |
| `src/services/chatService.test.ts` | Unitario |
| `src/utils/http.test.ts` | Unitario |

---

## 10. Dependencias de Desarrollo

| Librería | Versión | Rol |
|---|---|---|
| **typescript** | ^5.6.3 | Compilador TypeScript |
| **@types/express** | — | Tipos TypeScript para Express |
| **@types/node** | — | Tipos TypeScript para Node.js |
| **@types/cors** | — | Tipos TypeScript para cors |
| **@types/morgan** | — | Tipos TypeScript para morgan |

---

## 11. Resumen de Dependencias por Categoría

| Categoría | Librerías |
|---|---|
| **Framework HTTP** | express |
| **Runtime / Lenguaje** | Node.js 20, TypeScript 5.6, tsx |
| **Base de datos / ORM** | @prisma/client, prisma, @supabase/supabase-js |
| **Seguridad** | helmet, cors |
| **Logging** | morgan |
| **Pagos** | mercadopago, transbank-sdk |
| **Mapas** | Google Maps Places API (HTTP proxy) |
| **Validación** | zod |
| **Testing** | vitest, supertest |
| **Tipado** | typescript, @types/express, @types/node |

---

## 12. Observaciones

| Observación | Descripción |
|---|---|
| Prisma en `dependencies` (no devDependencies) | Confirma uso en runtime de producción, no solo en desarrollo |
| CORS dinámico | Acepta múltiples orígenes via `FRONTEND_ORIGIN` (separados por coma) y cualquier subdominio `*.vercel.app` |
| Service Role Key solo en backend | `SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse al cliente; solo se usa en el backend y en Route Handlers admin del frontend |
| Sin librería de rate limiting | No se detecta `express-rate-limit`; recomendable agregar en producción |
