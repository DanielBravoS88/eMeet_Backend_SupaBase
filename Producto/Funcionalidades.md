# Funcionalidades del Sistema eMeet

> Este documento clasifica las funcionalidades detectadas en el repositorio `eMeet_frontend` según su estado de implementación. Las funcionalidades que dependen del backend se señalan con nota cuando no pueden ser validadas directamente desde el frontend.

---

## 1. Funcionalidades Implementadas ✅

### Autenticación y Sesión

| Funcionalidad | Componente / Archivo | Detalles |
|---|---|---|
| Login con email y contraseña | `AuthContext.tsx`, `LoginForm.tsx` | Llama a `POST /api/auth/login` en el backend; fallback local sin Supabase |
| Registro con email y contraseña | `AuthContext.tsx`, `SignUpForm.tsx` | Llama a `POST /api/auth/register`; soporta registro por rol |
| Login con Google (OAuth) | `AuthContext.tsx` | `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| Login con Apple (OAuth) | `AuthContext.tsx` | `supabase.auth.signInWithOAuth({ provider: 'apple' })` |
| Callback OAuth | `app/auth/callback/route.ts` | Maneja el redirect de Supabase post-OAuth |
| Verificación de email | `app/auth/verify-email/page.tsx` | Pantalla de confirmación cuando Supabase requiere verificación |
| Logout | `AuthContext.tsx` | Llama a `POST /api/auth/logout` + `supabase.auth.signOut()` |
| Protección de rutas (middleware) | `middleware.ts` | Redirige a `/auth` si no hay sesión en rutas protegidas |
| Protección de rutas por rol | `middleware.ts`, `ProtectedRoute.tsx` | Valida rol `admin` y `locatario`; redirige si no corresponde |
| Persistencia de sesión | `AuthContext.tsx`, `@supabase/ssr` | Cookie-based sessions; sesión persiste entre recargas |
| Modo fallback sin Supabase | `AuthContext.tsx` | Si `hasSupabaseEnv=false`, usa `localStorage` con usuario simulado |
| Sincronización de perfil post-login | `AuthContext.syncUserData()` | Carga perfil, likes y guardados desde el backend en paralelo |

---

### Feed de Descubrimiento

| Funcionalidad | Componente / Archivo | Detalles |
|---|---|---|
| Feed de swipe de lugares cercanos | `app/page.tsx`, `SwipeCard.tsx` | Stack de tarjetas animadas con Framer Motion |
| Geolocalización del usuario | `NearbyPlacesContext.tsx` | `navigator.geolocation.getCurrentPosition()` |
| Carga de lugares desde Google Places | `useNearbyPlaces.ts`, `placesService.ts` | `google.maps.places.PlacesService.nearbySearch()` |
| Filtro por tipo de lugar | `PlaceTypeFilters.tsx`, `NearbyPlacesContext.tsx` | Chips seleccionables (restaurant, bar, café, etc.) |
| Filtro por distancia | `DistanceFilter.tsx`, `NearbyPlacesContext.tsx` | Slider de distancia en km |
| Swipe right (like) | `SwipeCard.tsx`, `app/page.tsx` | Persiste like en backend/localStorage |
| Swipe left (descartar) | `SwipeCard.tsx`, `app/page.tsx` | Excluye el lugar del feed local |
| Botón bookmark (guardar) | `SwipeCard.tsx` | Guarda el lugar en `/saved` |
| Toast de feedback | `app/page.tsx` | Feedback visual verde/rojo tras swipe |
| Estado vacío del feed | `app/page.tsx` | Pantalla con opción de reiniciar cuando no hay más tarjetas |
| Esqueleto de carga (skeleton) | `app/page.tsx` | Animación shimmer mientras carga el feed |
| Mapa interactivo lateral | `BellavistaMap.tsx` | Mapa Google Maps con marcadores de lugares cercanos |
| Enriquecimiento de lugares | `NearbyPlacesContext.tsx` | Fetch de foto, web, teléfono y horarios para los 2 primeros lugares |

---

### Guardados y Likes

| Funcionalidad | Componente / Archivo | Detalles |
|---|---|---|
| Vista de lugares guardados | `app/saved/page.tsx` | Lista de lugares con image lateral |
| Eliminar de guardados | `app/saved/page.tsx` | Remove del estado local y backend |
| Persistencia de likes/guardados | `AuthContext.tsx`, `LocatarioEventsContext.tsx` | Vía `user_events` en Supabase (backend) o localStorage |

---

### Chat Comunitario

| Funcionalidad | Componente / Archivo | Detalles |
|---|---|---|
| Lista de salas de chat | `app/chat/page.tsx`, `ChatContext.tsx` | Carga desde `/api/chat/rooms` del backend |
| Sala de chat individual | `app/chat/[roomId]/page.tsx` | Historial de mensajes de la sala |
| Enviar mensajes | `ChatContext.sendMessage()` | Con actualización optimista; se reemplaza con ID real del servidor |
| Recibir mensajes en tiempo real | `ChatContext.tsx` | Suscripción a Supabase Realtime (INSERT en `chat_messages`) |
| Unirse a una sala | `ChatContext.joinRoom()` | `POST /api/chat/rooms/:id/join` |
| Marcar sala como leída | `ChatContext.markRoomRead()` | `POST /api/chat/rooms/:id/read` |
| Contador de no leídos | `ChatContext.tsx` | Calculado desde `rooms[].unreadCount` |
| Modo local sin Supabase | `ChatContext.tsx` | Usa `localStorage` cuando `hasSupabaseEnv=false` |

---

### Perfil del Usuario

| Funcionalidad | Componente / Archivo | Detalles |
|---|---|---|
| Ver perfil | `app/profile/page.tsx` | Muestra datos del usuario autenticado |
| Editar perfil | `AuthContext.updateUser()` | `PATCH /api/profile` → actualiza estado global |
| Editar intereses | `app/profile/page.tsx` | Chips de categorías seleccionables |
| Cerrar sesión | `app/profile/page.tsx` | Llama a `AuthContext.logout()` |

---

### Panel de Administrador

| Funcionalidad | Componente / Archivo | Detalles |
|---|---|---|
| Dashboard con KPIs | `app/admin/page.tsx`, `KpiCard.tsx` | Total usuarios, eventos, comunidades, reportes pendientes |
| Gráfico de área (tickets) | `TicketAreaChart.tsx` | Visualización de interacciones por tiempo (Recharts) |
| Gráfico donut (categorías) | `CategoryDonut.tsx` | Distribución de eventos por categoría (Recharts) |
| Tabla de eventos recientes | `EventsTable.tsx` | Lista con título, categoría, estado y fecha |
| Gestión de eventos | `app/admin/events/page.tsx` | Vista de gestión de todos los eventos publicados |
| Gestión de usuarios | `app/admin/users/page.tsx` | Vista de gestión de usuarios del sistema |
| Moderación | `app/admin/moderation/page.tsx` | Revisión y resolución de reportes |
| Finanzas | `app/admin/finance/page.tsx` | Estadísticas financieras del sistema |
| Sidebar de navegación admin | `src/components/admin/Sidebar.tsx` | Navegación entre subrutas del panel |

---

### Panel de Locatario

| Funcionalidad | Componente / Archivo | Detalles |
|---|---|---|
| Crear evento propio | `app/locatario/page.tsx`, `LocatarioEventsContext.createLocatarioEvent()` | `POST /events/locatario` |
| Eliminar evento propio | `LocatarioEventsContext.removeLocatarioEvent()` | `DELETE /events/locatario/:id` |
| Lista de eventos propios | `app/locatario/page.tsx` | Carga desde `/events/locatario` |
| Subida de imagen de evento | `ImageUpload.tsx`, `useImageUpload.ts` | Supabase Storage |
| Subida de video de evento | `VideoUpload.tsx`, `useVideoUpload.ts` | Supabase Storage |
| Selector de ubicación en mapa | `LocationPickerMap.tsx` | Mapa interactivo para seleccionar lat/lng del evento |
| Selector de fecha y hora | `DateTimePicker.tsx` | Calendario para fecha del evento |

---

## 2. Funcionalidades Parcialmente Implementadas 🔄

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Detalle expandido de evento | Parcial | No existe página dedicada de detalle; el modal de `SwipeCard` en `/search` es el acercamiento actual |
| Búsqueda en `/search` | Parcial | La UI existe; la integración con datos reales del backend para búsqueda avanzada está pendiente de validar |
| Estadísticas de likes/guardados en perfil | Parcial | Se muestra el conteo desde el estado local, no desde el backend en tiempo real |

---

## 3. Funcionalidades Mock o Simuladas 🎭

| Funcionalidad | Descripción del mock |
|---|---|
| Autenticación sin Supabase | Si `NEXT_PUBLIC_SUPABASE_URL` no está configurado, `AuthContext` usa `localStorage` con usuario simulado basado en el email ingresado |
| Roles inferidos por email | En modo local, el rol se determina por el contenido del email: `admin@` → admin, `locatario@` → locatario, cualquier otro → user |
| Chat sin backend | `ChatContext` usa `localStorage` cuando `hasSupabaseEnv=false` |
| Eventos de locatario sin backend | `LocatarioEventsContext` guarda en `localStorage` cuando no hay conexión |
| Datos mock de eventos | `src/data/mockEvents.ts` contiene ~20 eventos de ejemplo para desarrollo; actualmente no se inyectan en el feed real (este usa Google Places) |
| Statuses de eventos en admin | En el dashboard admin, los statuses (live/draft/flagged) se asignan en demo rotation desde el array `DEMO_STATUSES` ya que el campo no existe en la API actual |

---

## 4. Funcionalidades Pendientes ⏳

| Funcionalidad | Prioridad | Detalle |
|---|---|---|
| Notificaciones push | Media | Mencionadas en roadmap; sin implementación actual |
| PWA (Progressive Web App) | Baja | Sin `manifest.json` ni service worker |
| Modo oscuro / claro | Baja | Solo modo oscuro disponible actualmente |
| Pruebas automatizadas E2E (Playwright) | Media | El backend tiene suite Vitest parcial; el frontend no tiene tests E2E |
| Perfil expandido de locatario (analítica) | Media | Panel básico existe; analítica avanzada pendiente |
| Flujo de reporte del usuario final | Media | Solo visible en panel admin; el usuario normal no puede reportar aún |

---

## 5. Funcionalidades del Backend (`eMeet_Backend_SupaBase`)

El backend Express.js está completamente implementado y desplegado en Render: https://emeet-backend-supabase-p0i6.onrender.com

| Ruta backend | Funcionalidad | Estado |
|---|---|---|
| `GET /health` | Health check | ✅ Implementado |
| `POST /auth/login` | Login con email | ✅ Implementado |
| `POST /auth/register` | Registro de usuario | ✅ Implementado |
| `POST /auth/logout` | Cierre de sesión | ✅ Implementado |
| `POST /auth/reset-password` | Recuperación de contraseña | ✅ Implementado |
| `GET /profile` | Obtener perfil del usuario | ✅ Implementado |
| `PATCH /profile` | Actualizar perfil + avatar | ✅ Implementado |
| `GET /events/liked` | Eventos con like del usuario | ✅ Implementado |
| `GET /events/saved` | Eventos guardados del usuario | ✅ Implementado |
| `POST /events/locatario` | Crear evento de locatario (se publica directo en estado `live`) | ✅ Implementado |
| `GET /events/locatario` | Listar eventos del locatario | ✅ Implementado |
| `GET /events/locatario/public` | Listar eventos públicos de locatarios (feed) | ✅ Implementado |
| `GET /events/locatario/stats` | Stats del creador: likes e integrantes de chat por evento, totales y evento top | ✅ Implementado |
| `DELETE /events/locatario/:id` | Eliminar evento del locatario | ✅ Implementado |
| `GET /chat/rooms` | Listar salas de chat | ✅ Implementado |
| `POST /chat/rooms/:id/join` | Unirse a sala | ✅ Implementado |
| `GET /chat/rooms/:id/messages` | Mensajes de una sala | ✅ Implementado |
| `POST /chat/rooms/:id/messages` | Enviar mensaje | ✅ Implementado |
| `POST /chat/rooms/:id/read` | Marcar sala como leída | ✅ Implementado |
| `GET /places/search-nearby` | Búsqueda de lugares (Google Maps proxy) | ✅ Implementado |
| `GET /places/photo` | Proxy de fotos de Google Maps | ✅ Implementado |
| `GET /admin/stats` | KPIs del panel admin | ✅ Implementado |
| `GET /admin/reports` | Reportes de contenido | ✅ Implementado |
| `PATCH /admin/reports/:id` | Resolver reporte | ✅ Implementado |
| `/monetization` (tokens, pagos, QR, cupones, campañas) | Monetización completa | ✅ Implementado |

### Monetización implementada

| Funcionalidad | Detalle |
|---|---|
| Billetera de tokens por usuario | `token_wallets` + `token_transactions` |
| Compra de tokens | Integración Mercado Pago + Transbank vía `/monetization` |
| Pagos con Mercado Pago | Checkout + Webhook de confirmación |
| Pagos con Transbank WebPay Plus | Pago con tarjeta de débito/crédito |
| Cupones de descuento | Generación, uso y validación por QR |
| Validación QR de cupones | `qr_validations` — locatario escanea y valida |
| Campañas de promoción | `promotion_campaigns` — locatarios compran visibilidad |
