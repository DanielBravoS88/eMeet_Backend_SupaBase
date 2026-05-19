# Diagramas UML — Proyecto eMeet

> Todos los diagramas están representados en formato **Mermaid** y se basan en el análisis real de ambos repositorios: `eMeet_frontend` y `eMeet_Backend_SupaBase`.

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
    L -->|Comprar tokens| SYS
    L -->|Crear campaña de promoción| SYS
    L -->|Generar cupón con QR| SYS
    L -->|Pagar con Mercado Pago / Transbank| SYS

    A -->|Ver dashboard y KPIs| SYS
    A -->|Gestionar usuarios| SYS
    A -->|Gestionar eventos publicados| SYS
    A -->|Moderar contenido y reportes| SYS
    A -->|Resolver reportes de usuarios| SYS
    A -->|Ver estadísticas financieras| SYS
    A -->|Gestionar transacciones| SYS

    SYS -->|Supabase Auth| SA[(Supabase Auth)]
    SYS -->|Google Places API| GP[(Google Places)]
    SYS -->|Supabase Realtime| RT[(Supabase Realtime)]
    SYS -->|eMeet_Backend_SupaBase| BE[(Backend API REST)]
    SYS -->|Mercado Pago| MP[(Mercado Pago)]
    SYS -->|Transbank WebPay| TB[(Transbank)]
    SYS -->|Deezer API| DZ[(Deezer)]
```

---

## 2. Diagrama de Componentes

```mermaid
flowchart TD
    subgraph FRONTEND ["eMeet_frontend — Next.js 14 App Router"]
        direction TB

        subgraph PAGES ["Páginas — app/"]
            P1["/ — FeedPage"]
            P2["/auth — AuthPage"]
            P3["/chat — ChatPage"]
            P4["/chat/[roomId] — ChatRoomPage"]
            P5["/search — SearchPage"]
            P6["/saved — SavedPage"]
            P7["/profile — ProfilePage"]
            P8["/admin — AdminDashboard"]
            P9["/locatario — LocatarioPanel"]
        end

        subgraph PROVIDERS ["Providers — src/providers/"]
            APP[AppProviders]
            GM[GoogleMapsProvider]
        end

        subgraph CONTEXTS ["Contextos — src/context/"]
            AUTH[AuthContext]
            CHAT[ChatContext]
            NEAR[NearbyPlacesContext]
            LOC[LocatarioEventsContext]
        end

        subgraph COMPS ["Componentes — src/components/"]
            SW[SwipeCard]
            LAY[Layout]
            NAV["NavBar / BottomNavBar / SidebarNav"]
            MAP[BellavistaMap]
            LOG["LoginForm / SignUpForm"]
            ADM["AdminShell, KpiCard, EventsTable…"]
            OTH["DistanceFilter, PlaceTypeFilters, ImageUpload, LocationPickerMap"]
        end

        subgraph LIB ["Lib — src/lib/"]
            SUP_C["supabase.ts — clientes browser/server"]
            CN["cn.ts — classnames helper"]
            FA["fetchApi.ts — fetch helper con auth"]
            AS["authSession.ts — helpers de sesión"]
        end

        subgraph HOOKS ["Hooks — src/hooks/"]
            HNP[useNearbyPlaces]
            HIU[useImageUpload]
            HVU[useVideoUpload]
        end

        subgraph API ["Route Handlers — app/api/"]
            RH1["api/admin/stats — Service Role Key"]
            RH2["api/admin/reports — Service Role Key"]
            RH3["api/admin/finance — Service Role Key"]
            RH4["api/deezer — proxy musical"]
            RH5["api/keepalive — keep-alive Render"]
            RH6["auth/callback — OAuth Supabase"]
        end

        subgraph MW ["Middleware"]
            MWR["middleware.ts — protección de rutas"]
        end
    end

    subgraph BACKEND ["eMeet_Backend_SupaBase — Express.js 4 + Node.js 20 + TypeScript"]
        direction TB

        subgraph MW_BE ["Middleware — src/middleware/"]
            AUTH_MW["auth.ts — withAuth / requireRole"]
        end

        subgraph ROUTES ["Rutas — src/routes/"]
            RT_AUTH["/auth — registro, login, syncUserData"]
            RT_PROFILE["/profile — GET / PATCH perfil"]
            RT_EVENTS["/events — like, save, locatario CRUD"]
            RT_CHAT["/chat — salas y mensajes"]
            RT_PLACES["/places — búsqueda de lugares"]
            RT_ADMIN["/admin — stats, usuarios, reportes"]
            RT_MONET["/monetization — tokens, pagos, cupones QR"]
        end

        subgraph SERVICES ["Servicios — src/services/"]
            SVC_CHAT["chatService.ts — lógica de salas / cleanup"]
            SVC_PLACES["placesService.ts — Google Places proxy"]
        end

        subgraph BE_LIB ["Lib + Config — src/lib/ + src/config/"]
            BE_SUP["supabase.ts — clientes anon / service-role"]
            BE_ENV["env.ts — variables de entorno tipadas"]
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

    FA -->|"REST + Bearer JWT"| ROUTES
    ROUTES --> AUTH_MW
    ROUTES --> SERVICES
    ROUTES --> BE_LIB
    AUTH_MW --> BE_SUP
    SERVICES --> BE_LIB

    SUP_C -->|"Supabase Auth + Realtime"| SB[(Supabase)]
    BE_SUP -->|"PostgREST / Realtime"| SB
    MAP -->|"Places API"| GME[(Google Maps Platform)]
    SVC_PLACES -->|"Places API"| GME
    RT_MONET -->|"Checkout"| MP[(Mercado Pago)]
    RT_MONET -->|"WebPay"| TB[(Transbank)]
    RH4 -->|"API musical"| DZ[(Deezer)]
```

---

## 3. Diagrama de Flujo General de la Aplicación

```mermaid
flowchart TD
    START(["Usuario accede a la URL"]) --> MW{"Middleware<br/>¿Sesión activa?"}

    MW -->|"No / Ruta protegida"| AUTH_PAGE["/auth — Login / Registro"]
    MW -->|Sí| ROLE{"¿Rol del usuario?"}

    AUTH_PAGE --> LOGIN_ACTION{"¿Login o Registro?"}
    LOGIN_ACTION -->|Login| SUPABASE_LOGIN["Supabase Auth — login"]
    LOGIN_ACTION -->|Registro| SUPABASE_REG["Supabase Auth — registro"]
    LOGIN_ACTION -->|"OAuth Google/Apple"| OAUTH["OAuth → /auth/callback"]

    SUPABASE_LOGIN --> SYNC["syncUserData — cargar perfil y eventos"]
    SUPABASE_REG --> EMAIL_VER{"¿Requiere<br/>verificación?"}
    EMAIL_VER -->|Sí| VERIFY["/auth/verify-email"]
    EMAIL_VER -->|No| SYNC
    OAUTH --> SYNC

    SYNC --> ROLE

    ROLE -->|user| FEED["/ — Feed de lugares"]
    ROLE -->|admin| ADMIN["/admin — Panel Admin"]
    ROLE -->|locatario| LOCAT["/locatario — Panel Locatario"]

    FEED --> GEOLOCATE[Solicitar geolocalización]
    GEOLOCATE --> PLACES["Google Places API — lugares cercanos"]
    PLACES --> SWIPE{"Usuario interactúa<br/>con tarjetas"}

    SWIPE -->|Like| LIKE_ACTION["POST /events/like → Backend"]
    LIKE_ACTION --> JOIN_CHAT{"¿Unirse al chat?"}
    JOIN_CHAT -->|Sí| CHAT["/chat/[roomId] — Chat en tiempo real"]
    SWIPE -->|Guardar| SAVE_ACTION["POST /events/save → Backend"]
    SWIPE -->|Descartar| EXCLUDE[Excluir lugar del feed local]

    CHAT --> REALTIME["Supabase Realtime — Suscripción chat_messages"]

    FEED --> NAV[Navegación inferior]
    NAV -->|Search| SEARCH["/search"]
    NAV -->|Saved| SAVED["/saved"]
    NAV -->|Profile| PROFILE["/profile"]
    NAV -->|Chat| CHAT

    PROFILE --> UPDATE["PATCH /profile → Backend"]
    SAVED --> LOAD_SAVED["GET /events/saved → Backend"]

    ADMIN --> STATS["GET /admin/stats → Backend"]
    LOCAT --> LOCAT_EVENTS["GET/POST /events/locatario → Backend"]
    LOCAT --> MONET["POST /monetization/purchase → Backend"]
    MONET --> PAY{"¿Pasarela de pago?"}
    PAY -->|"Mercado Pago"| MP["Redirect Checkout MP"]
    PAY -->|Transbank| TB["Redirect WebPay"]
    MP --> CONFIRM_MP["GET /monetization/mercadopago/callback"]
    TB --> CONFIRM_TB["POST /monetization/transbank/confirm"]
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

    class TokenWallet {
        +String id
        +String userId
        +Number balance
        +String updatedAt
    }

    class PaymentOrder {
        +String id
        +String userId
        +Number amount
        +String currency
        +String status
        +String provider
        +String externalId
        +String createdAt
    }

    class Coupon {
        +String id
        +String code
        +Number discount
        +String usedBy
        +String usedAt
        +String expiresAt
    }

    class PromotionCampaign {
        +String id
        +String creatorId
        +String title
        +Number budgetTokens
        +String status
        +String createdAt
    }

    User "1" --> "0..*" UserEvent : genera
    User "0..*" --> "0..*" ChatRoom : pertenece a
    ChatRoom "1" --> "0..*" ChatMessage : contiene
    ChatMessage "1" --> "1" User : enviado por
    ScrapedPlace --> Event : se adapta a\n(placeFeedAdapter)
    AuthState --> User : contiene
    UserEvent --> Event : referencia
    User "1" --> "1" TokenWallet : posee
    User "1" --> "0..*" PaymentOrder : realiza
    User "1" --> "0..*" PromotionCampaign : crea
    Coupon "0..1" --> "1" User : usado por
```

---

## 5. Notas sobre los Diagramas

- Los diagramas representan el estado actual de ambos repositorios (`eMeet_frontend` y `eMeet_Backend_SupaBase`) según el análisis directo del código.
- El backend `eMeet_Backend_SupaBase` está completamente analizado: Express.js 4.21 + Node.js 20 + TypeScript 5.6 + Prisma 6.19, con 7 grupos de rutas confirmados en `src/app.ts`.
- Las 14 tablas de Supabase fueron confirmadas desde el tipo `Database` en `src/lib/supabase.ts` del frontend y las rutas del backend.
- La clase `ScrapedPlace` representa los datos obtenidos desde Google Places API y se transforma en objetos `Event` mediante el adaptador `src/data/placeFeedAdapter.ts`.
- Los servicios externos de pago (Mercado Pago, Transbank) y música (Deezer) son proxiados exclusivamente por el backend Express — no se llaman directamente desde el frontend.
