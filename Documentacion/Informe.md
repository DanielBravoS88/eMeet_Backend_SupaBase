# Informe técnico — eMeet

## 1. Introducción

eMeet es una plataforma web para la gestión de eventos sociales. Permite a organizadores publicar eventos y a usuarios descubrirlos, interactuar en tiempo real y realizar transacciones. El sistema está construido sobre una arquitectura cliente-servidor desacoplada.

---

## 2. Descripción del sistema

### 2.1 Módulos principales
| Módulo | Descripción |
|--------|-------------|
| Autenticación | Registro, login y sesiones mediante Supabase Auth (JWT) |
| Perfiles | Gestión de perfil de usuario con avatar y preferencias |
| Eventos | Creación, búsqueda, likes y guardado de eventos |
| Chat | Salas de mensajería en tiempo real por evento |
| Lugares | Integración con Google Maps Places API |
| Moderación | Panel admin con reportes y KPIs |
| Monetización | Transacciones: tickets, suscripciones y comisiones |

### 2.2 Endpoints de la API
| Ruta | Función |
|------|---------|
| `GET /health` | Estado del servicio |
| `POST /auth/login` | Inicio de sesión |
| `POST /auth/register` | Registro de usuario |
| `GET /profile` | Obtener perfil autenticado |
| `GET /events/locatario` | Eventos del organizador |
| `GET /chat/rooms` | Salas de chat disponibles |
| `GET /places/search` | Buscar lugares cercanos |
| `GET /admin/reports` | Reportes de moderación |
| `GET /monetization/transactions` | Transacciones |

---

## 3. Arquitectura

Para más detalle ver [`Arquitectura.md`](Arquitectura.md).

- **Frontend**: Next.js desplegado en Vercel.
- **Backend**: Express/Node.js desplegado en Render.
- **Base de datos**: PostgreSQL en Supabase con Auth, Storage y Realtime.

---

## 4. Tecnologías utilizadas

### Backend
- Node.js 18+, TypeScript, Express 5, Prisma 6, Supabase JS 2, Helmet, Morgan, Vitest.

### Frontend
- Next.js 15, TypeScript, Tailwind CSS.

### Infraestructura
- Render (backend), Vercel (frontend), Supabase (BD + Auth + Storage).

---

## 5. Seguridad

- Autenticación con JWT validado por Supabase en cada request.
- Middleware de roles (admin, locatario, usuario) protege rutas sensibles.
- CORS configurado con whitelist de dominios permitidos, incluyendo soporte dinámico para previews de Vercel.
- HTTP hardening con Helmet.

---

## 6. Testing

- Framework: Vitest.
- Pruebas unitarias en `src/middleware/auth.test.ts` para el middleware de autenticación.
- Ejecutar con: `npm test`.

---

## 7. Despliegue

- **Backend**: push a `main` dispara despliegue automático en Render.
- **Frontend**: push a `main` dispara despliegue automático en Vercel.
- Configurar variables de entorno según `.env.example`.

---

## 8. Conclusiones

El proyecto eMeet cumple con los objetivos de proveer una API REST robusta para eventos sociales con autenticación segura, chat en tiempo real y capacidad de monetización, todo desplegado y funcional en infraestructura cloud.
