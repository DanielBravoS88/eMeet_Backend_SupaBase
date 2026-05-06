-- =============================================================================
-- Datos-Prueba.sql — eMeet
-- Datos de ejemplo para entorno de desarrollo y pruebas
--
-- INSTRUCCIONES:
-- 1. Ejecutar primero Script-BD.sql para crear el esquema.
-- 2. Ejecutar este script en SQL Editor de Supabase (proyecto de pruebas).
--
-- NOTA: Los UUIDs de usuario deben coincidir con usuarios reales en auth.users.
--       Estos datos son ilustrativos para pruebas locales/staging únicamente.
-- =============================================================================

-- =============================================================================
-- Usuarios de prueba (perfiles) — requiere que existan en auth.users
-- En Supabase, los perfiles se crean automáticamente via trigger al registrarse.
-- Aquí se insertan directamente para pruebas.
-- =============================================================================

-- Perfil de usuario normal
insert into public.profiles (id, name, role, bio, location, interests)
values
  ('00000000-0000-0000-0000-000000000001', 'Juan Pérez',     'user',      'Usuario fan de eventos culturales.',   'Santiago, Chile', ARRAY['musica', 'cultura', 'teatro']),
  ('00000000-0000-0000-0000-000000000002', 'María González', 'user',      'Amante de la gastronomía y el arte.',  'Valparaíso, Chile', ARRAY['gastronomia', 'arte']),
  ('00000000-0000-0000-0000-000000000003', 'Café Evento',    'locatario', 'Organizador de eventos gastronómicos.','Santiago, Chile', ARRAY['gastronomia', 'networking']),
  ('00000000-0000-0000-0000-000000000004', 'Administrador',  'admin',     'Administrador del sistema.',           'Santiago, Chile', ARRAY[]::text[])
on conflict (id) do nothing;

-- =============================================================================
-- Eventos de locatario
-- =============================================================================
insert into public.locatario_events
  (id, creator_id, title, description, category, event_date, address, price, organizer_name, status)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'Festival Gastronómico Primavera',
    'Disfruta de los mejores platos de la temporada con chefs reconocidos.',
    'gastronomia',
    now() + interval '7 days',
    'Av. Providencia 1234, Santiago',
    5000,
    'Café Evento',
    'live'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'Noche de Jazz en el Parque',
    'Concierto de jazz al aire libre. Entrada gratuita.',
    'musica',
    now() + interval '14 days',
    'Parque Balmaceda, Santiago',
    0,
    'Café Evento',
    'live'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Networking Emprendedores',
    'Conecta con otros emprendedores y amplía tu red de contactos.',
    'networking',
    now() + interval '3 days',
    'WeWork Las Condes, Santiago',
    3000,
    'Café Evento',
    'draft'
  )
on conflict (id) do nothing;

-- =============================================================================
-- Salas de chat
-- =============================================================================
insert into public.chat_rooms (id, event_title, event_address)
values
  ('10000000-0000-0000-0000-000000000001', 'Festival Gastronómico Primavera', 'Av. Providencia 1234, Santiago'),
  ('10000000-0000-0000-0000-000000000002', 'Noche de Jazz en el Parque',      'Parque Balmaceda, Santiago')
on conflict (id) do nothing;

-- =============================================================================
-- Miembros de salas de chat
-- =============================================================================
insert into public.room_members (room_id, user_id, joined_at, last_read_at)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', now() - interval '2 days', now() - interval '1 day'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', now() - interval '1 day',  now() - interval '1 hour'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', now() - interval '1 day',  now())
on conflict do nothing;

-- =============================================================================
-- Mensajes de chat
-- =============================================================================
insert into public.chat_messages (room_id, user_id, text, created_at)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '¡Qué buena pinta tiene este evento!',          now() - interval '2 days'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '¡Sí! Ya compré mi ticket.',                    now() - interval '1 day'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '¿Llevan algo de beber?',                       now() - interval '1 hour'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Me encantan los conciertos al aire libre 🎷',  now() - interval '12 hours')
on conflict do nothing;

-- =============================================================================
-- Acciones de usuarios sobre eventos (likes, guardados)
-- =============================================================================
insert into public.user_events (user_id, event_id, event_title, action)
values
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Festival Gastronómico Primavera', 'like'),
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Noche de Jazz en el Parque',      'save'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Festival Gastronómico Primavera', 'save')
on conflict do nothing;

-- =============================================================================
-- Transacciones de prueba
-- =============================================================================
insert into public.transactions (type, description, amount, status, event_id, user_id)
values
  ('ticket',      'Compra ticket Festival Gastronómico', 5000, 'completado', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('ticket',      'Compra ticket Festival Gastronómico', 5000, 'completado', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
  ('suscripcion', 'Suscripción plan locatario mensual',  9990, 'completado', null,                                   '00000000-0000-0000-0000-000000000003'),
  ('comision',    'Comisión plataforma 5%',               250, 'completado', '10000000-0000-0000-0000-000000000001', null)
on conflict do nothing;

-- =============================================================================
-- Reportes de moderación
-- =============================================================================
insert into public.reports (type, description, target_type, target_id, reporter_id, status)
values
  ('spam',          'Este evento parece ser spam.',       'event', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'pending'),
  ('inappropriate', 'Contenido inapropiado en el chat.',  'user',  '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'dismissed')
on conflict do nothing;
