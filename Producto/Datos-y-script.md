# Datos y Scripts — Proyecto eMeet

> Este documento describe el manejo de datos en el proyecto eMeet: datos mock, estructura real de la base de datos en Supabase, y una propuesta de scripts SQL para inicialización y pruebas.
>
> ⚠️ **Importante**: Las tablas SQL confirmadas provienen del análisis del tipo `Database` en `src/lib/supabase.ts`. Los scripts propuestos más abajo son una **propuesta documentada** para fines académicos y de desarrollo; **no son scripts aplicados** en producción.

---

## 1. Datos Mock Existentes en el Frontend

### `src/data/mockEvents.ts`

El repositorio contiene un archivo de datos mock con eventos de ejemplo. Estos datos se usan principalmente para desarrollo local y para el contexto inicial de la aplicación cuando no hay datos reales disponibles.

**Tipo de datos**: Array de objetos `Event[]`

**Categorías de eventos incluidas**:
- gastronomia
- musica
- cultura
- networking
- deporte
- fiesta
- teatro
- arte

**Estructura de cada evento mock**:
```typescript
{
  id: string           // UUID o string único
  title: string        // Nombre del evento/lugar
  description: string  // Descripción
  category: EventCategory
  date: string         // ISO 8601
  location: string     // Nombre del lugar
  address: string      // Dirección
  distance: number     // km desde el usuario
  price: number | null // null = gratis
  imageUrl: string     // URL de imagen (Unsplash o similar)
  organizerName: string
  organizerAvatar: string
  attendees: number
  capacity: number | null
  tags: string[]
}
```

**Helpers disponibles en el mismo archivo**:
- `formatEventDate(date: string): string` — Formatea fechas ISO 8601 a texto legible.
- `formatPrice(price: number | null): string` — "Gratis" o "$X.XXX".
- `CATEGORY_COLORS: Record<EventCategory, string>` — Colores Tailwind por categoría.
- `CATEGORY_EMOJI: Record<EventCategory, string>` — Emoji representativo por categoría.

---

## 2. Datos de Google Places API (Dinámicos)

Los datos del feed principal provienen en tiempo real desde la **Google Maps Places API**, no desde una base de datos interna. El proceso es:

1. El usuario otorga permiso de geolocalización.
2. `NearbyPlacesContext` genera un `LatLngBounds` alrededor de la posición del usuario.
3. `useNearbyPlaces` llama a `google.maps.places.PlacesService.nearbySearch()`.
4. Los resultados `ScrapedPlace[]` se adaptan a `Event[]` mediante `placeFeedAdapter.ts`.

**Estos datos no se almacenan en Supabase**. El backend Express proxea las consultas a Google Places desde `/places`, protegiendo la API key del cliente. No existe una tabla `cached_places`; los lugares se obtienen en tiempo real.

---

## 3. Estructura Real de la Base de Datos (Supabase)

Las siguientes 14 tablas están confirmadas desde el tipo `Database` en `src/lib/supabase.ts` del frontend y las rutas del backend `eMeet_Backend_SupaBase`. El proyecto Supabase es: `https://supabase.com/dashboard/project/ksghpwonmnxmbhmfpaog`.

---

## 4. Propuesta de Script SQL de Inicialización

> ⚠️ El siguiente script es una **propuesta académica** basada en la estructura de tablas inferida desde el código del frontend. **No es un script aplicado** en producción. Debe ser revisado y ajustado por el equipo antes de ejecutarse.

```sql
-- ──────────────────────────────────────────────────────────────────────────────
-- PROPUESTA DE SCRIPT SQL — eMeet Backend (Supabase PostgreSQL)
-- Basado en análisis del tipo Database de src/lib/supabase.ts
-- ⚠️ Script propuesto para fines académicos — No aplicado en producción
-- ──────────────────────────────────────────────────────────────────────────────

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tipo enum para roles
CREATE TYPE user_role AS ENUM ('user', 'locatario', 'admin');

-- ── Tipo enum para acciones de usuario sobre eventos
CREATE TYPE user_action AS ENUM ('like', 'save');

-- ── Tipo enum para categorías de evento
CREATE TYPE event_category AS ENUM (
  'gastronomia', 'musica', 'cultura', 'networking',
  'deporte', 'fiesta', 'teatro', 'arte'
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla: profiles
-- Extiende auth.users de Supabase
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL DEFAULT '',
  role              user_role NOT NULL DEFAULT 'user',
  bio               TEXT NOT NULL DEFAULT '',
  avatar_url        TEXT,
  location          TEXT NOT NULL DEFAULT '',
  business_name     TEXT,
  business_location TEXT,
  interests         event_category[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla: user_events
-- Acciones del usuario sobre eventos/lugares
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id        TEXT NOT NULL,
  event_title     TEXT,
  event_image_url TEXT,
  event_address   TEXT,
  action          user_action NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id, action)
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla: chat_rooms
-- Salas comunitarias por lugar
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_rooms (
  id              TEXT PRIMARY KEY,  -- igual al placeId de Google Places
  event_title     TEXT NOT NULL DEFAULT '',
  event_image_url TEXT,
  event_address   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla: room_members
-- Miembros de cada sala de chat
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS room_members (
  room_id     TEXT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla: chat_messages
-- Mensajes de chat
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    TEXT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla: locatario_events
-- Eventos publicados por locatarios
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locatario_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id       UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
  title            TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  category         event_category NOT NULL,
  event_date       TIMESTAMPTZ NOT NULL,
  address          TEXT NOT NULL DEFAULT '',
  price            NUMERIC,
  image_url        TEXT,
  video_url        TEXT,
  organizer_name   TEXT NOT NULL DEFAULT '',
  organizer_avatar TEXT,
  lat              DOUBLE PRECISION,
  lng              DOUBLE PRECISION,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla: token_wallets
-- Billetera de tokens por usuario
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS token_wallets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance    INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla: token_transactions
-- Historial de movimientos de tokens
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS token_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id   UUID NOT NULL REFERENCES token_wallets(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  type        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla: payment_orders
-- Órdenes de pago (MercadoPago / Transbank)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount      NUMERIC NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'CLP',
  status      TEXT NOT NULL DEFAULT 'pending',
  provider    TEXT NOT NULL,
  external_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla: promotion_campaigns
-- Campañas de promoción de locatarios
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promotion_campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  budget_tokens INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla: coupons
-- Cupones de descuento con código único
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code       TEXT NOT NULL UNIQUE,
  discount   NUMERIC NOT NULL,
  used_by    UUID REFERENCES profiles(id),
  used_at    TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla: transactions
-- Registro contable general
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  amount     NUMERIC NOT NULL,
  status     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla: reports
-- Reportes de contenido por usuarios
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id),
  reason           TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla: qr_validations
-- Validaciones de cupones mediante QR
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qr_validations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id    UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  validated_by UUID NOT NULL REFERENCES profiles(id),
  validated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 5. Propuesta de Datos de Prueba

> ⚠️ Los siguientes datos son **ficticios y de ejemplo** para facilitar el desarrollo y las pruebas. No representan usuarios reales.

```sql
-- ── Usuarios de prueba (deben existir en auth.users antes)
-- Insertar perfiles después de crear usuarios en Supabase Auth Dashboard

INSERT INTO profiles (id, name, role, bio, location, interests) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Daniel Bravo', 'admin', 'Administrador del sistema', 'Santiago, Chile', ARRAY['gastronomia','musica']::event_category[]),
  ('00000000-0000-0000-0000-000000000002', 'Francisco Levipil', 'locatario', 'Dueño de Bar Constitución', 'Santiago, Chile', ARRAY['musica','fiesta']::event_category[]),
  ('00000000-0000-0000-0000-000000000003', 'Antonio Vivar', 'user', 'Explorando panoramas', 'Santiago, Chile', ARRAY['cultura','arte']::event_category[]);

-- ── Sala de chat de ejemplo
INSERT INTO chat_rooms (id, event_title, event_address) VALUES
  ('ChIJtest001', 'Bar Constitución', 'Constitución 40, Bellavista, Santiago');

-- ── Miembro de la sala
INSERT INTO room_members (room_id, user_id) VALUES
  ('ChIJtest001', '00000000-0000-0000-0000-000000000003');

-- ── Mensaje de prueba
INSERT INTO chat_messages (room_id, user_id, text) VALUES
  ('ChIJtest001', '00000000-0000-0000-0000-000000000003', '¡Hola comunidad!');

-- ── Evento de locatario de prueba
INSERT INTO locatario_events (creator_id, title, description, category, event_date, address, price, organizer_name)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Jazz Night en Bar Constitución',
  'Noche de jazz en vivo con músicos locales.',
  'musica',
  '2026-06-15 22:00:00+00',
  'Constitución 40, Bellavista, Santiago',
  3500,
  'Bar Constitución'
);
```

---

## 6. Propuesta de Consultas Frecuentes

```sql
-- Obtener perfil de un usuario
SELECT * FROM profiles WHERE id = auth.uid();

-- Obtener likes de un usuario
SELECT event_id FROM user_events WHERE user_id = auth.uid() AND action = 'like';

-- Obtener guardados de un usuario
SELECT event_id FROM user_events WHERE user_id = auth.uid() AND action = 'save';

-- Obtener salas donde el usuario es miembro
SELECT cr.*, rm.unread_count
FROM chat_rooms cr
JOIN room_members rm ON rm.room_id = cr.id
WHERE rm.user_id = auth.uid();

-- Obtener mensajes de una sala (últimos 50)
SELECT cm.*, p.name AS sender_name, p.avatar_url AS sender_avatar
FROM chat_messages cm
JOIN profiles p ON p.id = cm.user_id
WHERE cm.room_id = $1
ORDER BY cm.created_at ASC
LIMIT 50;

-- Obtener eventos del locatario autenticado
SELECT * FROM locatario_events
WHERE creator_id = auth.uid()
ORDER BY created_at DESC;
```

---

## 7. Relación con Supabase

| Elemento | Detalle |
|---|---|
| Proyecto Supabase | https://supabase.com/dashboard/project/ksghpwonmnxmbhmfpaog |
| Esquema utilizado | `public` |
| Autenticación | Supabase Auth — tabla `auth.users` (gestionada por Supabase) |
| Tiempo real | Supabase Realtime activado en tabla `chat_messages` (INSERT) |
| Storage | Supabase Storage para imágenes y videos de eventos y avatares |
| Backup | Ver `/Gestion/Backup-BD.md` para el procedimiento de respaldo |

---

## 8. Información Pendiente por Validar

| Elemento | Estado |
|---|---|
| Esquema SQL completo con índices y triggers | ⏳ Pendiente — requiere acceso a Supabase o `eMeet_Backend_Supabase` |
| Políticas RLS aplicadas | ⏳ Pendiente |
| Funciones SQL o procedimientos almacenados | ⏳ Pendiente |
| Script real de migraciones del backend | ⏳ Pendiente — requiere acceso a `eMeet_Backend_Supabase` |
| Campos `lat` y `lng` en `locatario_events` (inferidos del código, no del tipo Supabase) | ⏳ Pendiente de sincronización |
