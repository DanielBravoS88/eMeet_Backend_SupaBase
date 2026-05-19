# Wireframes Textuales — Proyecto eMeet

> Este documento describe las pantallas principales detectadas en el repositorio `eMeet_frontend`, con wireframes en formato ASCII y descripción de componentes y flujos de navegación.

---

## 1. Pantalla de Autenticación — `/auth`

**Objetivo**: Permitir al usuario iniciar sesión o registrarse en la plataforma.

**Componentes principales**: `LoginForm`, `SignUpForm`, tabs de modo (login/registro), botones OAuth.

**Flujo de navegación**: Si el usuario está autenticado → redirigir a `/` (o a su ruta de rol).

```
┌────────────────────────────────────────────────────┐
│                   eMeet                            │
│         Descubre panoramas cercanos                │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  [ Iniciar sesión ]  [ Crear cuenta ]        │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  Email:     [________________________]       │  │
│  │  Contraseña:[________________________]  👁   │  │
│  │                                              │  │
│  │  [       Iniciar sesión →         ]          │  │
│  │                                              │  │
│  │  ─────────────── o ───────────────           │  │
│  │                                              │  │
│  │  [G] Continuar con Google                    │  │
│  │  [🍎] Continuar con Apple                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  Selector de tipo de cuenta:                       │
│  [ Usuario ] [ Locatario ] [ Admin ]               │
└────────────────────────────────────────────────────┘
```

---

## 2. Feed Principal — `/`

**Objetivo**: Mostrar lugares cercanos en formato de tarjetas con mecánica de swipe.

**Componentes principales**: `SwipeCard` (stack), `Layout`, `DistanceFilter`, `PlaceTypeFilters`, `BellavistaMap`.

**Flujo de navegación**: Swipe right → like + posible join al chat. Swipe left → descartar. Botón bookmark → guardar.

```
┌────────────────────────────────────────────────────┐
│  eMeet   🔔  📍 Santiago                          │
│                                                    │
│  Filtros: [ 🍽 ] [ 🍺 ] [ 🎵 ] [ ☕ ] [ + ]      │
│  Distancia: ●────────── 3 km                      │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │                 [imagen]                     │  │
│  │  🏷 Gastronomía            ⭐ 4.5            │  │
│  │                                              │  │
│  │  La Bodeguita del Medio                     │  │
│  │  📍 Lastarria 123 · 0.8 km                  │  │
│  │  🕐 Abierto ahora                            │  │
│  │  💲 Precio: $$                               │  │
│  │  🏷 bar  coctelería  jazz                    │  │
│  │                                              │  │
│  │  [ ✕ ]   [ 🔖 ]   [ ♥ ]                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ← Mapa de lugares cercanos →                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  [   Google Maps   ]                         │  │
│  │  📌 marcadores de lugares                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  [ 🏠 ] [ 🔍 ] [ 💬 ] [ 🔖 ] [ 👤 ]             │
└────────────────────────────────────────────────────┘
```

---

## 3. Búsqueda y Exploración — `/search`

**Objetivo**: Buscar y filtrar lugares por categoría y texto libre.

**Componentes principales**: Barra de búsqueda, chips de categoría, grid de resultados, modal de detalle con `SwipeCard`.

**Flujo de navegación**: Toque en tarjeta → abre modal de detalle. Chip de categoría → filtra la lista.

```
┌────────────────────────────────────────────────────┐
│  Explorar                                          │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  🔍 Buscar lugares o eventos...              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  [ Todos ] [ Restaurantes ] [ Bares ] [ Cafés ]   │
│  [ Música ] [ Cultura ] [ Deporte ] ...            │
│                                                    │
│  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  [imagen]    │  │  [imagen]                │   │
│  │  Nombre      │  │  Nombre                  │   │
│  │  📍 0.5 km   │  │  📍 1.2 km               │   │
│  │  ⭐ 4.2      │  │  ⭐ 4.7                  │   │
│  └──────────────┘  └──────────────────────────┘   │
│                                                    │
│  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  [imagen]    │  │  [imagen]                │   │
│  │  Nombre      │  │  Nombre                  │   │
│  │  📍 2.1 km   │  │  📍 0.9 km               │   │
│  └──────────────┘  └──────────────────────────┘   │
│                                                    │
│  [ 🏠 ] [ 🔍 ] [ 💬 ] [ 🔖 ] [ 👤 ]             │
└────────────────────────────────────────────────────┘
```

---

## 4. Guardados — `/saved`

**Objetivo**: Mostrar los lugares guardados (con bookmark) por el usuario.

**Componentes principales**: Lista de lugares con imagen lateral y metadata. Botón de eliminar de guardados.

**Flujo de navegación**: Toque en ítem → detalle del lugar. Botón eliminar → remove de guardados.

```
┌────────────────────────────────────────────────────┐
│  Guardados (5)                                     │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ [img] Bar Constitución            [ 🗑 ]     │  │
│  │       📍 Barrio Italia · 1.5 km              │  │
│  │       ⭐ 4.3  ·  🍺 Bar                     │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ [img] Café Literatura             [ 🗑 ]     │  │
│  │       📍 Providencia · 0.8 km                │  │
│  │       ⭐ 4.6  ·  ☕ Café                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ [img] Sala Cuna                   [ 🗑 ]     │  │
│  │       📍 Bellavista · 2.2 km                 │  │
│  │       ⭐ 4.1  ·  🎵 Música                  │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  [ 🏠 ] [ 🔍 ] [ 💬 ] [ 🔖 ] [ 👤 ]             │
└────────────────────────────────────────────────────┘
```

---

## 5. Perfil del Usuario — `/profile`

**Objetivo**: Visualizar y editar el perfil, intereses y configuración de la cuenta.

**Componentes principales**: Avatar, nombre, bio, chips de intereses, estadísticas, botón logout.

**Flujo de navegación**: Editar → PATCH /api/profile → actualizar AuthContext. Logout → cerrar sesión.

```
┌────────────────────────────────────────────────────┐
│                   Mi Perfil                        │
│                                                    │
│              [ 🤳 Avatar ]                         │
│              Nombre Apellido                       │
│              user@emeet.com                        │
│              📍 Santiago, Chile                    │
│                                                    │
│  ─────────────── Bio ───────────────               │
│  "Explorando panoramas cerca de mí..."             │
│  [ ✏ Editar ]                                      │
│                                                    │
│  ─────────────── Intereses ─────────────           │
│  [🍽 Gastronomía] [🎵 Música] [🎭 Teatro]          │
│  [💪 Deporte] [🎨 Arte] [ + agregar ]              │
│                                                    │
│  ─────────────── Estadísticas ──────────           │
│  ❤️  12 likes   🔖 5 guardados   📅 3 eventos     │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  [ Cerrar sesión ]                           │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  [ 🏠 ] [ 🔍 ] [ 💬 ] [ 🔖 ] [ 👤 ]             │
└────────────────────────────────────────────────────┘
```

---

## 6. Chat — `/chat`

**Objetivo**: Mostrar la lista de salas de chat a las que pertenece el usuario.

**Componentes principales**: Lista de salas con preview del último mensaje, contador de no leídos.

**Flujo de navegación**: Toque en sala → `/chat/[roomId]`.

```
┌────────────────────────────────────────────────────┐
│  Comunidades  🔔 (3)                               │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ [img] Bar Constitución           (2) →       │  │
│  │       "El DJ de esta noche es..."            │  │
│  │       hace 5 min                             │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ [img] Sala Cuna                  (1) →       │  │
│  │       "¿Alguien va al show?"                 │  │
│  │       hace 12 min                            │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ [img] Café Literatura                →       │  │
│  │       "Tienen mesa disponible!"              │  │
│  │       hace 1 h                               │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  [ 🏠 ] [ 🔍 ] [ 💬 ] [ 🔖 ] [ 👤 ]             │
└────────────────────────────────────────────────────┘
```

---

## 7. Sala de Chat — `/chat/[roomId]`

**Objetivo**: Chat en tiempo real entre miembros de la comunidad de un lugar.

**Componentes principales**: Historial de mensajes, campo de texto, botón enviar, avatar de participantes.

**Flujo de navegación**: Mensajes llegan en tiempo real vía Supabase Realtime. Enviar → POST /api/chat/rooms/:id/messages.

```
┌────────────────────────────────────────────────────┐
│  ← Bar Constitución         👥 24 miembros         │
│                                                    │
│  ─────────────────────────────────────────────     │
│  [👤] María González            12:30              │
│      "El DJ de esta noche es increíble!"           │
│                                                    │
│                            12:35  [👤]             │
│            "¿A qué hora empieza el show?"          │
│                                                    │
│  [👤] Carlos Ramos               12:38             │
│      "Creo que a las 22:00 hrs"                    │
│                                                    │
│                   (mensajes en tiempo real)        │
│  ─────────────────────────────────────────────     │
│                                                    │
│  ┌────────────────────────────────┐ [ Enviar ↑ ]  │
│  │ Escribe un mensaje...          │               │
│  └────────────────────────────────┘               │
└────────────────────────────────────────────────────┘
```

---

## 8. Panel de Administrador — `/admin`

**Objetivo**: Dashboard con KPIs, gestión de usuarios, eventos, moderación y finanzas.

**Componentes principales**: `AdminShell`, `KpiCard`, `TicketAreaChart`, `CategoryDonut`, `EventsTable`, `Sidebar`, `Topbar`.

**Flujo de navegación**: Sidebar → subrutas `/admin/events`, `/admin/users`, `/admin/moderation`, `/admin/finance`.

```
┌────────────────────────────────────────────────────┐
│  [eMeet Admin]                        👤 Admin    │
│  ┌────────────┬───────────────────────────────────┐│
│  │ Dashboard  │  Dashboard                        ││
│  │ Eventos    │                                   ││
│  │ Usuarios   │ ┌──────┐ ┌──────┐ ┌──────┐ ┌───┐ ││
│  │ Moderación │ │ 248  │ │  37  │ │  15  │ │ 4 │ ││
│  │ Finanzas   │ │Users │ │Events│ │Rooms │ │Rep│ ││
│  │            │ └──────┘ └──────┘ └──────┘ └───┘ ││
│  │            │                                   ││
│  │            │  [── Área Chart — Tickets ──]     ││
│  │            │                                   ││
│  │            │  [── Donut — Categorías ──]       ││
│  │            │                                   ││
│  │            │  Eventos Recientes                ││
│  │            │  ┌──────────────────────────────┐ ││
│  │            │  │ Título · Cat · Estado · Fecha │ ││
│  │            │  └──────────────────────────────┘ ││
│  └────────────┴───────────────────────────────────┘│
└────────────────────────────────────────────────────┘
```

---

## 9. Panel de Locatario — `/locatario`

**Objetivo**: Permitir a los locatarios crear, gestionar y visualizar sus eventos propios.

**Componentes principales**: Formulario de creación de evento, tabla de eventos, `ImageUpload`, `VideoUpload`, `LocationPickerMap`, `DateTimePicker`.

**Flujo de navegación**: Crear evento → POST /events/locatario → aparece en feed del usuario.

```
┌────────────────────────────────────────────────────┐
│  Panel Locatario                    Mi Negocio 🏪  │
│                                                    │
│  ─────────────── Crear Evento ──────────────       │
│  Título:    [__________________________________]   │
│  Categoría: [ Gastronomía ▼ ]                      │
│  Fecha:     [ 📅 Seleccionar ]                     │
│  Dirección: [ 📍 Seleccionar en mapa ]             │
│  Precio:    [________] (vacío = gratis)            │
│  Imagen:    [ 📷 Subir imagen ]                    │
│  Video:     [ 🎬 Subir video (opcional) ]          │
│                                                    │
│  [ Publicar evento ]                               │
│                                                    │
│  ─────────────── Mis Eventos ───────────────       │
│  ┌──────────────────────────────────────────────┐  │
│  │ Jazz Night · Música · 15/06/2026 · [ 🗑 ]   │  │
│  │ Cata de Vinos · Gastro · 22/06/2026 · [ 🗑 ]│  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## 10. Flujo de Navegación General

```mermaid
flowchart LR
    AUTH["/auth"] -->|Login exitoso - user| HOME["/feed"]
    AUTH -->|Login exitoso - admin| ADMIN["/admin"]
    AUTH -->|Login exitoso - locatario| LOCAT["/locatario"]

    HOME <-->|BottomNavBar| SEARCH["/search"]
    HOME <-->|BottomNavBar| CHAT_LIST["/chat"]
    HOME <-->|BottomNavBar| SAVED["/saved"]
    HOME <-->|BottomNavBar| PROFILE["/profile"]
    CHAT_LIST -->|Abrir sala| CHAT_ROOM["/chat/roomId"]
```
