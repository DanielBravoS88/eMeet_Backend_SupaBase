# Código Fuente — eMeet Frontend

---

## 1. Ubicación del Código Fuente

El repositorio `eMeet_frontend` contiene todo el código fuente del frontend de la aplicación eMeet. Se encuentra en la raíz del repositorio bajo las siguientes carpetas principales:

```
eMeet_frontend/
├── app/                    ← Rutas del App Router de Next.js (páginas y layouts)
├── src/                    ← Código fuente principal (componentes, contextos, hooks, lib)
├── public/                 ← Archivos estáticos públicos (favicon, SVGs)
├── docs/                   ← Documentos técnicos internos del equipo
├── Documentacion/          ← Documentación académica (creada en esta entrega)
├── Producto/               ← Antecedentes técnicos del producto
├── Gestion/                ← Gestión del proyecto
├── middleware.ts            ← Middleware de protección de rutas (Next.js)
├── next.config.mjs          ← Configuración de Next.js
├── package.json             ← Dependencias y scripts
├── tailwind.config.js       ← Configuración de Tailwind CSS
├── tsconfig.json            ← Configuración de TypeScript
└── README.md                ← README principal del repositorio
```

---

## 2. Estructura Detallada del Código

### `app/` — Páginas y rutas (Next.js App Router)

```
app/
├── layout.tsx              ← Layout raíz: metadatos, fuentes, AppProviders, TopLoader
├── page.tsx                ← Feed principal (/) con swipe de lugares
├── template.tsx            ← Template global para animaciones de página
├── loading.tsx             ← Componente de carga global
├── auth/
│   ├── page.tsx            ← Página de login y registro
│   ├── callback/route.ts   ← Route Handler para callback OAuth de Supabase
│   ├── verify-email/page.tsx ← Página de verificación de email
│   └── auth-map-illustration.svg
├── chat/
│   ├── page.tsx            ← Lista de salas de chat
│   ├── [roomId]/page.tsx   ← Sala de chat individual
│   └── loading.tsx
├── search/
│   ├── page.tsx            ← Búsqueda y exploración
│   └── loading.tsx
├── saved/
│   ├── page.tsx            ← Lugares guardados
│   └── loading.tsx
├── profile/
│   ├── page.tsx            ← Perfil del usuario
│   └── loading.tsx
├── admin/
│   ├── layout.tsx          ← Layout del panel admin
│   ├── page.tsx            ← Dashboard de administrador
│   ├── events/page.tsx     ← Gestión de eventos
│   ├── users/page.tsx      ← Gestión de usuarios
│   ├── moderation/page.tsx ← Moderación de contenido
│   └── finance/page.tsx    ← Estadísticas financieras
├── locatario/
│   └── page.tsx            ← Panel de locatario
└── api/
    ├── admin/
    │   ├── stats/route.ts  ← BFF: GET /admin/stats
    │   ├── reports/route.ts ← BFF: GET/POST /admin/reports
    │   ├── reports/[id]/route.ts ← BFF: PATCH /admin/reports/:id
    │   └── finance/route.ts ← BFF: GET /admin/finance
    └── auth/callback/route.ts ← Callback OAuth
```

### `src/` — Código fuente principal

```
src/
├── index.css               ← Estilos globales + directivas Tailwind
├── assets/                 ← Imágenes estáticas (hero.png, SVGs)
├── components/             ← Componentes reutilizables
│   ├── SwipeCard.tsx       ← Tarjeta de evento con drag y swipe (Framer Motion)
│   ├── Layout.tsx          ← Wrapper con Header, BottomNavBar y sidebar
│   ├── NavBar.tsx          ← Barra de navegación superior
│   ├── BottomNavBar.tsx    ← Navegación inferior fija
│   ├── SidebarNav.tsx      ← Sidebar de navegación lateral
│   ├── BellavistaMap.tsx   ← Mapa interactivo (Google Maps + Places)
│   ├── LocationPickerMap.tsx ← Selector de ubicación en mapa
│   ├── LoginForm.tsx       ← Formulario de login
│   ├── SignUpForm.tsx       ← Formulario de registro
│   ├── ProtectedRoute.tsx  ← Componente de protección de ruta (client)
│   ├── DistanceFilter.tsx  ← Slider de filtro de distancia
│   ├── PlaceTypeFilters.tsx ← Chips de filtro por tipo de lugar
│   ├── ImageUpload.tsx     ← Subida de imágenes a Supabase Storage
│   ├── VideoUpload.tsx     ← Subida de videos a Supabase Storage
│   ├── DateTimePicker.tsx  ← Selector de fecha y hora
│   └── admin/              ← Componentes del panel de administración
│       ├── AdminShell.tsx
│       ├── KpiCard.tsx
│       ├── EventsTable.tsx
│       ├── TicketAreaChart.tsx
│       ├── CategoryDonut.tsx
│       ├── Sidebar.tsx
│       └── Topbar.tsx
├── context/                ← Contextos globales de React
│   ├── AuthContext.tsx     ← Estado de autenticación y sesión
│   ├── ChatContext.tsx     ← Salas de chat y mensajes (Supabase Realtime)
│   ├── NearbyPlacesContext.tsx ← Lugares cercanos (Google Places API)
│   └── LocatarioEventsContext.tsx ← Eventos de locatarios
├── hooks/                  ← Custom hooks
│   ├── useNearbyPlaces.ts  ← Fetch de lugares cercanos desde Google Places
│   ├── useImageUpload.ts   ← Upload de imágenes a Supabase Storage
│   └── useVideoUpload.ts   ← Upload de videos a Supabase Storage
├── lib/                    ← Utilidades y clientes
│   ├── supabase.ts         ← Clientes Supabase (browser/server) + tipo Database
│   ├── cn.ts               ← Helper de composición de clases CSS (classnames)
│   ├── fetchApi.ts         ← Fetch helper con autenticación automática
│   └── authSession.ts      ← Helpers de sesión Supabase
├── providers/              ← Wrappers de providers
│   ├── AppProviders.tsx    ← Provider raíz (Auth + Chat + Locatario)
│   └── GoogleMapsProvider.tsx ← Provider de Google Maps
├── services/               ← Servicios de negocio
│   ├── placesService.ts    ← Configuración visual de tipos de lugar + queries
│   └── monetizationService.ts ← Servicio de monetización (pendiente)
├── types/
│   └── index.ts            ← Tipos TypeScript centrales (Event, User, ChatRoom, etc.)
└── data/
    ├── mockEvents.ts       ← Datos mock de eventos (para desarrollo sin backend)
    └── placeFeedAdapter.ts ← Adaptador ScrapedPlace → Event
```

---

## 3. Archivos de Configuración Relevantes

| Archivo | Descripción |
|---|---|
| `next.config.mjs` | Configuración de Next.js (no debe modificarse) |
| `tailwind.config.js` | Configuración de Tailwind CSS con tokens de color del proyecto |
| `tsconfig.json` | Configuración TypeScript con `strict: true` |
| `postcss.config.js` | Configuración de PostCSS para Tailwind |
| `middleware.ts` | Middleware de protección de rutas y validación de roles |
| `.gitignore` | Archivos ignorados por Git (incluye `.env.local`, `node_modules`, `.next`) |

---

## 4. Scripts Disponibles

Según el archivo `package.json` del proyecto:

| Script | Comando | Descripción |
|---|---|---|
| **Desarrollo** | `npm run dev` | Inicia el servidor de desarrollo con Turbopack (HMR ultra rápido) en `http://localhost:3000` |
| **Build** | `npm run build` | Compila TypeScript y genera el build de producción en `.next/` |
| **Producción** | `npm start` | Inicia el servidor Next.js con el build de producción |

> ⚠️ No existen scripts de test, lint ni preview definidos en `package.json`. Se recomienda agregarlos en futuras iteraciones.

---

## 5. Cómo Instalar las Dependencias

El proyecto utiliza **npm** como gestor de paquetes (confirmado por la presencia de `package-lock.json`):

```bash
# Desde la raíz del repositorio
npm install
```

> Requiere **Node.js** versión 18 o superior (recomendado: LTS 20.x o 22.x).

---

## 6. Cómo Ejecutar el Proyecto en Desarrollo

```bash
# 1. Clonar el repositorio
git clone https://github.com/DanielBravoS88/eMeet_frontend.git
cd eMeet_frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# (Editar .env.local con los valores reales — ver Ambiente-local.md)

# 4. Iniciar servidor de desarrollo
npm run dev
# → Disponible en http://localhost:3000
```

---

## 7. Cómo Construir el Proyecto

```bash
npm run build
# Genera el build optimizado en .next/
# Reporta errores de TypeScript y advertencias de Next.js

npm start
# Inicia el servidor con el build de producción
```

---

## 8. Archivos Importantes a No Modificar

| Archivo | Razón |
|---|---|
| `package.json` | Dependencias del proyecto; modificar puede romper la instalación |
| `tsconfig.json` | Configuración de TypeScript; modificar puede romper el tipado |
| `next.config.mjs` | Configuración de Next.js; modificar puede romper el build |
| `middleware.ts` | Protección de rutas crítica; modificar puede comprometer la seguridad |
| `src/lib/supabase.ts` | Tipo `Database` sincronizado con Supabase; modificar puede romper el tipado |
