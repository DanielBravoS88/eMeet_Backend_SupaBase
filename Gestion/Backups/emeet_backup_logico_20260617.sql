-- ============================================================================
--  RESPALDO LÓGICO DE BASE DE DATOS — Proyecto eMeet
--  Base de datos: Supabase PostgreSQL 15  (proyecto ksghpwonmnxmbhmfpaog)
--  Tipo de respaldo: Logical backup (esquema + datos de prueba)
--  Equivalente a: pg_dump --format=plain (schema + data)
--  Fecha de obtención del respaldo: 2026-06-17
--  Responsable: Equipo eMeet (Antonio Vivar — DBA de respaldo)
--  Uso: restauración del esquema y datos en un proyecto Supabase de pruebas.
--  NOTA: los datos incluidos son ficticios, generados para fines académicos.
-- ============================================================================

BEGIN;

-- ── Extensiones ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tipos enumerados ────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'locatario', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE user_action AS ENUM ('like', 'save');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE event_category AS ENUM (
    'gastronomia', 'musica', 'cultura', 'networking',
    'deporte', 'fiesta', 'teatro', 'arte'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
--  ESQUEMA (14 entidades — 6 dominios: Auth/Perfil, Eventos, Chat,
--           Monetización, Cupones y Moderación)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL DEFAULT '',
  role              user_role NOT NULL DEFAULT 'user',
  is_event_creator  BOOLEAN NOT NULL DEFAULT false,
  bio               TEXT NOT NULL DEFAULT '',
  avatar_url        TEXT,
  location          TEXT NOT NULL DEFAULT '',
  business_name     TEXT,
  business_location TEXT,
  interests         event_category[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS chat_rooms (
  id              TEXT PRIMARY KEY,
  event_title     TEXT NOT NULL DEFAULT '',
  event_image_url TEXT,
  event_address   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS room_members (
  room_id      TEXT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    TEXT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
  status           TEXT NOT NULL DEFAULT 'draft',   -- draft | live (RN-06)
  lat              DOUBLE PRECISION,
  lng              DOUBLE PRECISION,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS token_wallets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance    INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),   -- RN-04
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS token_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id   UUID NOT NULL REFERENCES token_wallets(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  type        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount      NUMERIC NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'CLP',
  status      TEXT NOT NULL DEFAULT 'pending',   -- pending|paid|failed|refunded
  provider    TEXT NOT NULL,                     -- mercadopago | transbank
  external_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promotion_campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id      UUID REFERENCES locatario_events(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'featured', -- featured|geo_boost|coupon|premium_badge
  budget_tokens INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active',   -- active|paused|finished
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES promotion_campaigns(id) ON DELETE CASCADE,
  code        TEXT NOT NULL UNIQUE,
  qr_token    TEXT NOT NULL UNIQUE,              -- RN-05: redención única
  discount    NUMERIC NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active',    -- active|redeemed|expired
  used_by     UUID REFERENCES profiles(id),
  used_at     TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS qr_validations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id    UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  validated_by UUID NOT NULL REFERENCES profiles(id),
  validated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id),
  target_type      TEXT,
  target_id        TEXT,
  reason           TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending',  -- pending|resolved|dismissed
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  amount     NUMERIC NOT NULL,
  status     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
--  DATOS DE PRUEBA (ficticios — entorno académico)
-- ============================================================================

INSERT INTO profiles (id, name, role, is_event_creator, bio, location, interests) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Daniel Bravo', 'admin', true,  'Administrador del sistema', 'Santiago, Chile', ARRAY['gastronomia','musica']::event_category[]),
  ('00000000-0000-0000-0000-000000000002', 'Francisco Levipil', 'locatario', true, 'Dueño de Bar Constitución', 'Santiago, Chile', ARRAY['musica','fiesta']::event_category[]),
  ('00000000-0000-0000-0000-000000000003', 'Antonio Vivar', 'user', false, 'Explorando panoramas', 'Santiago, Chile', ARRAY['cultura','arte']::event_category[])
ON CONFLICT (id) DO NOTHING;

INSERT INTO chat_rooms (id, event_title, event_address) VALUES
  ('ChIJtest001', 'Bar Constitución', 'Constitución 40, Bellavista, Santiago')
ON CONFLICT (id) DO NOTHING;

INSERT INTO room_members (room_id, user_id) VALUES
  ('ChIJtest001', '00000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

INSERT INTO chat_messages (room_id, user_id, text) VALUES
  ('ChIJtest001', '00000000-0000-0000-0000-000000000003', '¡Hola comunidad!');

INSERT INTO locatario_events
  (creator_id, title, description, category, event_date, address, price, status, organizer_name)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Jazz Night en Bar Constitución',
  'Noche de jazz en vivo con músicos locales.',
  'musica', '2026-06-15 22:00:00+00',
  'Constitución 40, Bellavista, Santiago', 3500, 'live', 'Bar Constitución'
);

INSERT INTO token_wallets (user_id, balance) VALUES
  ('00000000-0000-0000-0000-000000000002', 100)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- ============================================================================
--  FIN DEL RESPALDO LÓGICO — eMeet  (2026-06-17)
--  Restauración:  psql "<cadena_conexion_supabase_pruebas>" -f emeet_backup_logico_20260617.sql
-- ============================================================================
