# Definición e identificación del proyecto

## Nombre del proyecto
**eMeet** — Plataforma de eventos sociales

---

## Descripción general
eMeet es una plataforma web que permite a usuarios descubrir, crear y participar en eventos sociales. Los organizadores (locatarios) pueden publicar eventos, mientras que los usuarios pueden buscarlos, marcarlos como favoritos, asistir a salas de chat asociadas y realizar transacciones para adquirir tickets o suscripciones.

---

## Problema que resuelve
La dificultad de encontrar y organizar eventos sociales locales de forma centralizada, con herramientas de comunicación en tiempo real y gestión de pagos integrada.

---

## Objetivos del proyecto

### Objetivo general
Desarrollar una plataforma web full-stack funcional para la gestión de eventos sociales, con autenticación segura, comunicación en tiempo real y sistema de monetización.

### Objetivos específicos
1. Implementar un sistema de autenticación con roles (admin, locatario, usuario).
2. Permitir la creación y gestión de eventos por parte de locatarios.
3. Proveer salas de chat en tiempo real asociadas a eventos.
4. Integrar Google Maps Places API para localizar eventos.
5. Implementar un sistema de transacciones (tickets, suscripciones, comisiones).
6. Desarrollar un panel de administración con KPIs y moderación.

---

## Alcance

### Incluido
- API REST backend con Express/TypeScript
- Autenticación y autorización con Supabase Auth
- CRUD de eventos (locatarios)
- Sistema de likes y guardado de eventos (usuarios)
- Chat en tiempo real por sala
- Gestión de perfiles con avatar
- Sistema de reportes de moderación
- Transacciones financieras básicas
- Panel de administración

### Excluido
- Pasarela de pagos real (solo simulación)
- Notificaciones push
- Aplicación móvil

---

## Usuarios objetivo
| Rol | Descripción |
|-----|-------------|
| **Admin** | Moderación, KPIs, gestión de usuarios |
| **Locatario** | Organizar y publicar eventos |
| **Usuario** | Descubrir eventos, participar en chat, comprar tickets |

---

## Stack tecnológico

### Backend (este repositorio)
| Tecnología | Versión | Rol |
|------------|---------|-----|
| Node.js | 18+ | Runtime |
| TypeScript | 5.x | Lenguaje principal |
| Express | 5.x | Framework HTTP |
| Prisma | 6.x | ORM |
| Supabase | 2.x | Auth + BD + Storage |
| Vitest | 3.x | Testing |
| Helmet | - | Seguridad HTTP |

### Frontend (repositorio separado)
| Tecnología | Versión | Rol |
|------------|---------|-----|
| Next.js | 15+ | Framework React |
| TypeScript | 5.x | Lenguaje principal |
| Tailwind CSS | 3.x | Estilos |

### Infraestructura
| Servicio | Rol |
|----------|-----|
| Render | Hosting del backend |
| Vercel | Hosting del frontend |
| Supabase | Base de datos + Auth + Storage |

---

## Equipo y roles

| Integrante | GitHub | Responsabilidad principal |
|------------|--------|--------------------------|
| Daniel Bravo | DanielBravoS88 | Líder del proyecto, CORS, despliegue, integración |
| Antonio Vivar | Antonio-Vivar07 | Módulo de monetización, autenticación |
| Franco | Fr4nk017 | Bootstrap inicial, admin, autenticación, BD |
| Gustavo | Gustygithub | Frontend, UI/UX |

---

## Repositorios
- **Backend**: https://github.com/DanielBravoS88/eMeet_Backend_SupaBase
- **Frontend**: https://github.com/DanielBravoS88/eMeet_frontend

## URLs de producción
- **Backend API**: desplegado en Render
- **Frontend**: https://e-meet-frontend-nine.vercel.app/
