# Definición del Proyecto — eMeet

---

## 1. Nombre del Proyecto

**eMeet** — Plataforma de descubrimiento social de eventos y lugares cercanos.

---

## 2. Integrantes del Equipo

| Nombre | Rol sugerido |
|---|---|
| Daniel Bravo | Desarrollador Full-Stack / Líder técnico |
| Francisco Levipil | Desarrollador Full-Stack / Integración backend |
| Antoni Vivar | Desarrollador Frontend / UX |

> Para información detallada de cada integrante, ver [Integrantes.txt](./Integrantes.txt).

---

## 3. Descripción del Proyecto

eMeet es una plataforma web móvil-first que conecta a personas con eventos, bares, restaurantes y lugares de interés cercanos. Utiliza una mecánica de descubrimiento tipo swipe (deslizar tarjetas) combinada con geolocalización en tiempo real, un sistema de roles diferenciados (usuario, locatario, administrador) y comunidades de chat por lugar.

El proyecto está compuesto por dos repositorios:
- **`eMeet_frontend`**: frontend desarrollado en Next.js 14, React 18, TypeScript y Tailwind CSS.
- **`eMeet_Backend_Supabase`**: backend con lógica de negocio y API REST, apoyado en Supabase como plataforma de datos y autenticación.

---

## 4. Problema Identificado

Las personas que desean descubrir actividades, eventos y establecimientos cercanos a su ubicación deben navegar por múltiples plataformas desconectadas (Google Maps, redes sociales, sitios web de locales), sin una experiencia unificada, personalizada e intuitiva que facilite la toma de decisión y el descubrimiento social.

Adicionalmente, los propietarios de establecimientos carecen de una herramienta simple y directa para publicar y promocionar sus eventos hacia una audiencia localizada.

---

## 5. Justificación

El proyecto responde a una necesidad real del mercado de entretenimiento y gastronomía local. La combinación de geolocalización, mecánica de swipe y comunidades en tiempo real ofrece una propuesta diferenciadora frente a plataformas genéricas. Desde el punto de vista académico, el proyecto permite aplicar y demostrar competencias en:

- Desarrollo full-stack moderno con Next.js 14, TypeScript y Supabase.
- Integración de APIs externas (Google Maps Platform).
- Arquitectura orientada a microservicios lógicos con BFF.
- Diseño UX/UI mobile-first con Tailwind CSS y Framer Motion.

---

## 6. Objetivo General

Desarrollar una plataforma web móvil-first que permita a los usuarios descubrir, explorar y guardar eventos y lugares de interés cercanos, con soporte para comunidades en tiempo real, roles diferenciados y gestión de contenido, utilizando Next.js 14, Supabase y Google Maps Places API.

---

## 7. Objetivos Específicos

1. Implementar un sistema de autenticación con roles mediante Supabase Auth.
2. Desarrollar un feed de swipe de lugares obtenidos desde Google Maps Places API.
3. Construir un chat comunitario en tiempo real usando Supabase Realtime.
4. Desarrollar paneles diferenciados para locatarios y administradores.
5. Persistir preferencias, likes, guardados y mensajes en Supabase PostgreSQL.
6. Diseñar una arquitectura escalable con BFF en Next.js Route Handlers.
7. Documentar el proyecto con estándares académicos.

---

## 8. Alcance

### Incluye:
- Autenticación real con Supabase Auth (email, Google, Apple).
- Feed de swipe con lugares reales de Google Places.
- Filtros por tipo de lugar y distancia.
- Sistema de likes y guardados persistidos en Supabase.
- Chat comunitario en tiempo real.
- Panel de administración con KPIs y gestión.
- Panel de locatario para creación de eventos.
- Middleware de protección de rutas por rol.
- Documentación académica completa.

### No incluye:
- Sistema de pagos o tickets.
- Notificaciones push nativas.
- PWA instalable.
- Recuperación de contraseña (pendiente).
- Pruebas automatizadas (pendiente).

---

## 9. Restricciones

| Restricción | Detalle |
|---|---|
| **Tecnológica** | El frontend debe usar Next.js 14 App Router con TypeScript estricto |
| **Tiempo** | El proyecto debe estar listo para entrega académica en el plazo del curso |
| **Recursos** | Equipo de 3 personas con dedicación académica (no tiempo completo) |
| **Infraestructura** | Depende de servicios externos: Supabase (plan gratuito o pagado) y Google Maps (con cuota) |
| **Seguridad** | Credenciales y API keys no deben subirse al repositorio |

---

## 10. Supuestos

| Supuesto | Descripción |
|---|---|
| El backend `eMeet_Backend_Supabase` está o estará disponible | El frontend depende de su URL y endpoints |
| Supabase está configurado en el proyecto ksghpwonmnxmbhmfpaog | Confirmado por la URL del proyecto |
| Google Maps API key con cuota suficiente | Necesaria para el feed de lugares |
| Los integrantes tienen acceso al repositorio y al dashboard de Supabase | Requerido para configurar variables de entorno |

---

## 11. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Backend no disponible en tiempo de pruebas | Media | Alto | Usar modo local (localStorage) como fallback |
| Cuota de Google Maps API agotada | Media | Alto | Implementar caché en BFF, limitar llamadas |
| Pérdida de datos en Supabase | Baja | Alto | Configurar backups automáticos |
| Conflictos en ramas de Git | Media | Medio | Estrategia de ramas clara (ver Estrategia-de-ramas.md) |
| Sin pruebas automatizadas | Alta | Medio | Pruebas manuales documentadas antes de entrega |

---

## 12. Roles del Equipo

| Rol | Responsabilidades |
|---|---|
| **Desarrollador Full-Stack** | Implementar features del frontend y la integración con el backend |
| **Desarrollador Frontend** | Componentes UI, estilos Tailwind, animaciones Framer Motion |
| **Líder técnico** | Arquitectura del sistema, decisiones técnicas, revisión de código |
| **Integrador backend** | Conexión con `eMeet_Backend_Supabase`, Route Handlers, autenticación |

---

## 13. Entregables

| Entregable | Descripción | Estado |
|---|---|---|
| Repositorio `eMeet_frontend` | Código fuente completo del frontend | ✅ En producción |
| Repositorio `eMeet_Backend_Supabase` | Backend completo | 🔄 En progreso |
| Proyecto Supabase configurado | Base de datos, auth y realtime operativos | 🔄 En progreso |
| Documentación académica | `/Documentacion`, `/Producto`, `/Gestion` | ✅ Entregada en este PR |
| Pull Request hacia `main`/`dev` | PR con toda la documentación | ⏳ Pendiente |
| Informe académico impreso o digital | Archivo `Informe.md` exportado a PDF | ⏳ Pendiente |
