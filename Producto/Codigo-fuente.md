# Código Fuente — eMeet Backend

---

## 1. Ubicación del Código Fuente

El repositorio `eMeet_Backend_SupaBase` contiene el código fuente del backend de la aplicación eMeet. Se encuentra bajo las siguientes carpetas principales:

```
eMeet_Backend_SupaBase/
├── src/                    ← Código fuente principal
├── Documentacion/          ← Documentación académica
├── Producto/               ← Antecedentes técnicos del producto
├── Gestion/                ← Gestión del proyecto
├── package.json            ← Dependencias y scripts
├── tsconfig.json           ← Configuración TypeScript
├── .env                    ← Variables de entorno (NO commitear)
└── README.md               ← README principal del repositorio
```

---

## 2. Estructura Detallada del Código

### `src/` — Código fuente principal

```
src/
├── app.ts                  ← Configuración de Express: middlewares, rutas, CORS, Helmet
├── server.ts               ← Punto de entrada: inicia servidor en puerto 4000
├── config/
│   └── env.ts              ← Carga y valida variables de entorno desde process.env
├── lib/
│   └── supabase.ts         ← Clientes Supabase (anon y service role)
├── types/
│   ├── supabase.ts         ← Tipos generados de la base de datos Supabase
│   └── express.d.ts        ← Extensión del tipo Request de Express (userId, user)
├── middleware/
│   ├── auth.ts             ← Middleware JWT: verifica Bearer token con Supabase Auth
│   └── auth.test.ts        ← Tests unitarios del middleware de autenticación (Vitest)
├── routes/
│   ├── auth.routes.ts      ← POST /auth/login, /register, /logout, /reset-password
│   ├── auth.routes.test.ts ← Tests de integración de rutas de autenticación (Vitest + Supertest)
│   ├── profile.routes.ts   ← GET y PATCH /profile, upload de avatar a Supabase Storage
│   ├── events.routes.ts    ← like, save, CRUD de eventos de locatario
│   ├── events.ts           ← Lógica auxiliar de eventos
│   ├── chat.routes.ts      ← rooms, messages, join, read
│   ├── chat.ts             ← Lógica auxiliar de chat
│   ├── places.routes.ts    ← search-nearby, photo proxy de Google Maps
│   ├── admin.routes.ts     ← stats, reports, gestión de usuarios
│   └── monetization.routes.ts ← tokens, pagos (MercadoPago/Transbank), QR, cupones, campañas
├── services/
│   ├── chatService.ts      ← Lógica de negocio del chat (rooms, messages)
│   ├── chatService.test.ts ← Tests del servicio de chat (Vitest)
│   └── placesService.ts    ← Integración con Google Maps Places API
├── schemas/
│   └── monetization.schema.ts ← Validaciones Zod para endpoints de monetización
├── constants/
│   └── monetization.ts     ← Constantes del módulo de monetización
└── utils/
    ├── http.ts             ← Helpers HTTP (respuestas estandarizadas, error handlers)
    └── http.test.ts        ← Tests de los helpers HTTP (Vitest)
```

---

## 3. Archivos de Configuración Relevantes

| Archivo | Descripción |
|---|---|
| `tsconfig.json` | Configuración TypeScript con `target: ES2020`, `strict: true` |
| `package.json` | Dependencias y scripts del proyecto |
| `.env` | Variables de entorno locales — **nunca commitear** |
| `.gitignore` | Archivos ignorados (incluye `.env`, `node_modules`, `dist/`) |

---

## 4. Scripts Disponibles

Según el archivo `package.json` del proyecto:

| Script | Comando | Descripción |
|---|---|---|
| **Desarrollo** | `npm run dev` | `tsx watch src/server.ts` — recarga automática con hot reload en `http://localhost:4000` |
| **Build** | `npm run build` | `tsc` — compila TypeScript a `dist/` |
| **Producción** | `npm start` | `node dist/server.js` — inicia el servidor con el build compilado |
| **Tests** | `npm test` | `vitest run` — ejecuta todos los tests con Vitest |
| **Pre-dev** | `predev` | Libera el puerto 4000 antes de iniciar (evita conflictos) |

---

## 5. Grupos de Rutas (src/app.ts)

| Ruta | Archivo | Funcionalidad |
|---|---|---|
| `GET /health` | `app.ts` | Health check: `{ ok: true }` |
| `/auth` | `routes/auth.routes.ts` | login, register, logout, reset-password |
| `/profile` | `routes/profile.routes.ts` | GET y PATCH de perfil, subida de avatar |
| `/events` | `routes/events.routes.ts` | like, save, CRUD de eventos de locatario |
| `/chat` | `routes/chat.routes.ts` | rooms, messages, join, read |
| `/places` | `routes/places.routes.ts` | search-nearby, photo proxy de Google Maps |
| `/admin` | `routes/admin.routes.ts` | stats, reports, gestión de usuarios |
| `/monetization` | `routes/monetization.routes.ts` | tokens, pagos, QR, cupones, campañas |

---

## 6. Tests Disponibles (Vitest + Supertest)

| Archivo | Tipo | Descripción |
|---|---|---|
| `src/middleware/auth.test.ts` | Unitario | Tests del middleware de autenticación JWT |
| `src/routes/auth.routes.test.ts` | Integración | Tests de los endpoints de autenticación |
| `src/services/chatService.test.ts` | Unitario | Tests del servicio de chat |
| `src/utils/http.test.ts` | Unitario | Tests de los helpers HTTP |

---

## 7. Cómo Instalar las Dependencias

El proyecto utiliza **npm** como gestor de paquetes:

```bash
# Desde la raíz del repositorio
npm install
```

> Requiere **Node.js** versión 20 (igual que el entorno de producción en Render).

---

## 8. Cómo Ejecutar el Proyecto en Desarrollo

```bash
# 1. Clonar el repositorio
git clone https://github.com/DanielBravoS88/eMeet_Backend_SupaBase.git
cd eMeet_Backend_SupaBase

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# (Editar .env con los valores reales — ver Infraestructura-Cloud.md)

# 4. Iniciar servidor de desarrollo
npm run dev
# → Disponible en http://localhost:4000
# → GET http://localhost:4000/health  →  { ok: true }
```

---

## 9. Cómo Construir el Proyecto

```bash
npm run build
# Compila TypeScript a dist/
# Reporta errores de tipado

npm start
# Inicia el servidor con el build de producción (node dist/server.js)
```

---

## 10. Archivos Importantes a No Modificar

| Archivo | Razón |
|---|---|
| `package.json` | Dependencias del proyecto; modificar puede romper la instalación |
| `tsconfig.json` | Configuración de TypeScript; modificar puede romper el tipado |
| `src/config/env.ts` | Carga de variables de entorno; modificar puede exponer credenciales |
| `src/middleware/auth.ts` | Middleware de autenticación JWT crítico para la seguridad |
| `src/lib/supabase.ts` | Clientes Supabase con credenciales; modificar puede comprometer el acceso |
