# Diagramas UML — Proyecto eMeet

> Todos los diagramas están representados en formato **Mermaid** y se basan en el análisis real del repositorio `eMeet_frontend`. El backend `eMeet_Backend_Supabase` aparece como componente externo dada la falta de acceso directo a su repositorio.

---

## 1. Diagrama de Casos de Uso

```mermaid
flowchart TD
    U([Usuario Regular])
    L([Locatario])
    A([Administrador])
    SYS[[Sistema eMeet]]

    U -->|Registrarse / Iniciar sesión| SYS
    U -->|Explorar feed de lugares| SYS
    U -->|Dar like a un lugar| SYS
    U -->|Guardar un lugar| SYS
    U -->|Ver lugares guardados| SYS
    U -->|Buscar y filtrar lugares| SYS
    U -->|Unirse a sala de chat| SYS
    U -->|Enviar mensajes en chat| SYS
    U -->|Ver mensajes en tiempo real| SYS
    U -->|Editar perfil e intereses| SYS
    U -->|Cerrar sesión| SYS

    L -->|Registrarse como locatario| SYS
    L -->|Crear evento propio| SYS
    L -->|Eliminar evento propio| SYS
    L -->|Ver mis eventos publicados| SYS

    A -->|Ver dashboard y KPIs| SYS
    A -->|Gestionar usuarios| SYS
    A -->|Gestionar eventos publicados| SYS
    A -->|Moderar contenido y reportes| SYS
    A -->|Ver estadísticas financieras| SYS

    SYS -->|Supabase Auth| SA[(Supabase Auth)]
    SYS -->|Google Places API| GP[(Google Places)]
    SYS -->|Supabase Realtime| RT[(Supabase Realtime)]
    SYS -->|eMeet_Backend_Supabase| BE[(Backend API REST)]
```

---

## 2. Diagrama de Componentes

```mermaid
flowchart TD
    subgraph FRONTEND [eMeet_frontend — Next.js 14 App Router]
        direction TB

        subgraph PAGES [Páginas — app/]
            P1[/ — FeedPage]
            P2[/auth — AuthPage]
            P3[/chat — ChatPage]
            P4[/chat/roomId — ChatRoomPage]
            P5[/search — SearchPage]
            P6[/saved — SavedPage]
            P7[/profile — ProfilePage]
            P8[/admin — AdminDashboard]
            P9[/locatario — LocatarioPanel]
        end

        subgraph PROVIDERS [Providers — src/providers/]
            APP[AppProviders]
            GM[GoogleMapsProvider]
        end

        subgraph CONTEXTS [Contextos — src/context/]
            AUTH[AuthContext]
            CHAT[ChatContext]
            NEAR[NearbyPlacesContext]
            LOC[LocatarioEventsContext]
        end

        subgraph COMPS [Componentes — src/components/]
            SW[SwipeCard]
            LAY[Layout]
            NAV[NavBar / BottomNavBar / SidebarNav]
            MAP[BellavistaMap]
            LOG[LoginForm / SignUpForm]
            ADM[admin/AdminShell, KpiCard, EventsTable, etc.]
            OTH[DistanceFilter, PlaceTypeFilters, ImageUpload, LocationPickerMap]
        end

        subgraph LIB [Lib — src/lib/]
            SUP_C[supabase.ts — clientes browser/server]
            CN[cn.ts — classnames helper]
            FA[fetchApi.ts — fetch helper con auth]
            AS[authSession.ts — helpers de sesión]
        end

        subgraph HOOKS [Hooks — src/hooks/]
            HNP[useNearbyPlaces]
            HIU[useImageUpload]
            HVU[useVideoUpload]
        end

        subgraph API [Route Handlers — app/api/]
            BFF1[api/admin/stats]
            BFF2[api/admin/reports]
            BFF3[api/admin/finance]
            BFF4[auth/callback]
        end

        subgraph MW [Middleware]
            MWR[middleware.ts — protección de rutas]
        end
    end

    PAGES --> CONTEXTS
    PAGES --> COMPS
    CONTEXTS --> LIB
    HOOKS --> LIB
    COMPS --> HOOKS
    API --> LIB
    MW --> LIB
    PROVIDERS --> CONTEXTS

    SUP_C -->|Supabase Auth + Realtime| SB[(Supabase)]
    FA -->|REST + Bearer JWT| BE[(eMeet_Backend_Supabase)]
    MAP -->|Places API| GME[(Google Maps Platform)]
```

---

## 3. Diagrama de Flujo General de la Aplicación

```mermaid
flowchart TD
    START([Usuario accede a la URL]) --> MW{Middleware\n¿Sesión activa?}

    MW -->|No / Ruta protegida| AUTH_PAGE[/auth — Login / Registro]
    MW -->|Sí| ROLE{¿Rol del usuario?}

    AUTH_PAGE --> LOGIN_ACTION{¿Login o Registro?}
    LOGIN_ACTION -->|Login| SUPABASE_LOGIN[Supabase Auth — login]
    LOGIN_ACTION -->|Registro| SUPABASE_REG[Supabase Auth — registro]
    LOGIN_ACTION -->|OAuth Google/Apple| OAUTH[OAuth → /auth/callback]

    SUPABASE_LOGIN --> SYNC[syncUserData — cargar perfil y eventos]
    SUPABASE_REG --> EMAIL_VER{¿Requiere\nverificación?}
    EMAIL_VER -->|Sí| VERIFY[/auth/verify-email]
    EMAIL_VER -->|No| SYNC
    OAUTH --> SYNC

    SYNC --> ROLE

    ROLE -->|user| FEED[/ — Feed de lugares]
    ROLE -->|admin| ADMIN[/admin — Panel Admin]
    ROLE -->|locatario| LOCAT[/locatario — Panel Locatario]

    FEED --> GEOLOCATE[Solicitar geolocalización]
    GEOLOCATE --> PLACES[Google Places API — lugares cercanos]
    PLACES --> SWIPE{Usuario interactúa\ncon tarjetas}

    SWIPE -->|Like| LIKE_ACTION[Persistir like en Supabase]
    LIKE_ACTION --> JOIN_CHAT{¿Unirse al chat?}
    JOIN_CHAT -->|Sí| CHAT[/chat/roomId — Chat en tiempo real]
    SWIPE -->|Guardar| SAVE_ACTION[Persistir save en Supabase]
    SWIPE -->|Descartar| EXCLUDE[Excluir lugar del feed local]

    CHAT --> REALTIME[Supabase Realtime — Suscripción chat_messages]

    FEED --> NAV[Navegación inferior]
    NAV -->|Search| SEARCH[/search]
    NAV -->|Saved| SAVED[/saved]
    NAV -->|Profile| PROFILE[/profile]
    NAV -->|Chat| CHAT

    PROFILE --> UPDATE[PATCH /api/profile → Backend]
    SAVED --> LOAD_SAVED[GET /api/events/saved → Backend]

    ADMIN --> STATS[GET /api/admin/stats → Backend]
    LOCAT --> LOCAT_EVENTS[GET/POST /events/locatario → Backend]
```

---

## 4. Diagrama de Clases Conceptual

```mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        +UserRole role
        +String avatarUrl
        +String bio
        +EventCategory[] interests
        +String[] likedEvents
        +String[] savedEvents
        +String location
        +String createdAt
        +Boolean isVerified
        +String businessName
        +String businessLocation
    }

    class Event {
        +String id
        +String title
        +String description
        +EventCategory category
        +String date
        +String location
        +String address
        +Number distance
        +Number price
        +String imageUrl
        +String videoUrl
        +String organizerName
        +Number attendees
        +Number capacity
        +String[] tags
        +Boolean isLiked
        +Boolean isSaved
        +Number lat
        +Number lng
    }

    class ScrapedPlace {
        +String placeId
        +String name
        +String address
        +PlaceType type
        +String category
        +Number rating
        +Number totalRatings
        +Number priceLevel
        +Boolean isOpen
        +LatLng position
        +String photoUrl
        +String website
        +String phone
        +String[] openingHours
    }

    class ChatRoom {
        +String id
        +String eventTitle
        +String eventImageUrl
        +String eventAddress
        +Number memberCount
        +ChatMessage lastMessage
        +Number unreadCount
    }

    class ChatMessage {
        +String id
        +String roomId
        +String senderId
        +String senderName
        +String senderAvatar
        +String text
        +String timestamp
    }

    class UserEvent {
        +String id
        +String userId
        +String eventId
        +String action
        +String createdAt
    }

    class AuthState {
        +User user
        +Boolean isAuthenticated
        +String accessToken
    }

    User "1" --> "0..*" UserEvent : genera
    User "0..*" --> "0..*" ChatRoom : pertenece a
    ChatRoom "1" --> "0..*" ChatMessage : contiene
    ChatMessage "1" --> "1" User : enviado por
    ScrapedPlace --> Event : se adapta a\n(placeFeedAdapter)
    AuthState --> User : contiene
    UserEvent --> Event : referencia
```

---

## 5. Notas sobre los Diagramas

- Los diagramas representan el estado actual del repositorio `eMeet_frontend` según el análisis del código.
- El componente `eMeet_Backend_Supabase` se incluye como caja negra externa, ya que no fue posible analizar su código interno.
- Las tablas de Supabase (`profiles`, `user_events`, `chat_rooms`, `room_members`, `chat_messages`, `locatario_events`) fueron confirmadas desde el tipo `Database` en `src/lib/supabase.ts`.
- La clase `ScrapedPlace` representa los datos obtenidos desde Google Places API y se transforma en objetos `Event` mediante el adaptador `src/data/placeFeedAdapter.ts`.
