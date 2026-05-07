# Producto — eMeet Backend

Esta carpeta documenta los artefactos del producto del backend de eMeet.

## Contenido

| Recurso | Ubicación | Descripción |
|---------|-----------|-------------|
| Código fuente | [`src/`](../src/) | API REST en TypeScript/Express |
| Schema de BD | [`prisma/schema.prisma`](../prisma/schema.prisma) | Modelos de datos con Prisma ORM |
| Script SQL inicial | [`supabase/001_emeet_schema.sql`](../supabase/001_emeet_schema.sql) | Tablas, políticas RLS, Storage y Realtime |
| Dependencias | [`package.json`](../package.json) | Lista de librerías y versiones |
| Variables de entorno | [`.env.example`](../.env.example) | Plantilla de configuración |
| Configuración Supabase | [`SETUP_SUPABASE.md`](../SETUP_SUPABASE.md) | Guía de configuración de Supabase |

---

## Estructura del código fuente

```
src/
├── app.ts              # Configuración Express, middlewares, rutas
├── server.ts           # Entry point del servidor
├── config/             # Variables de entorno
├── routes/             # Handlers HTTP por módulo
│   ├── auth.routes.ts
│   ├── profile.routes.ts
│   ├── events.routes.ts
│   ├── chat.routes.ts
│   ├── places.routes.ts
│   ├── admin.routes.ts
│   └── monetization.routes.ts
├── middleware/         # Auth middleware + tests
├── services/           # Lógica de negocio (Places API)
├── schemas/            # Validaciones con Zod
├── lib/                # Clientes Supabase y Prisma
├── types/              # Tipos TypeScript
├── constants/          # Constantes
└── utils/              # Utilidades HTTP
```

---

## Base de datos

El esquema completo de la base de datos se encuentra en:
- **`supabase/001_emeet_schema.sql`**: script SQL para ejecutar en Supabase.
- **`prisma/schema.prisma`**: definición de modelos para Prisma ORM.

### Tablas principales
| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfiles de usuario |
| `locatario_events` | Eventos creados por organizadores |
| `user_events` | Interacciones usuario-evento (likes, guardados) |
| `chat_rooms` | Salas de chat por evento |
| `room_members` | Miembros de cada sala |
| `chat_messages` | Mensajes de chat |
| `reports` | Reportes de moderación |
| `transactions` | Transacciones financieras |

---

## Dependencias principales

| Librería | Versión | Uso |
|----------|---------|-----|
| express | 5.x | Framework HTTP |
| @supabase/supabase-js | 2.x | Cliente Supabase |
| @prisma/client | 6.x | ORM |
| helmet | - | Seguridad HTTP |
| morgan | - | Logging |
| zod | - | Validación de schemas |
| vitest | 3.x | Testing |

Ver [`package.json`](../package.json) para la lista completa.

---

## Cómo ejecutar localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 3. Modo desarrollo
npm run dev

# 4. Build de producción
npm run build
npm run start

# 5. Ejecutar tests
npm test
```

---

## Despliegue

- **Plataforma**: Render
- **Rama de producción**: `main`
- El despliegue se activa automáticamente ante cada push a `main`.
- Configurar las variables de entorno en el dashboard de Render según `.env.example`.
