-- Datos de prueba — eMeet (solo para ambiente de desarrollo/testing)
-- NO ejecutar en producción

-- Perfiles de prueba (los UUIDs deben existir en auth.users)
insert into public.profiles (id, name, role, bio, location)
values
  ('00000000-0000-0000-0000-000000000001', 'Daniel Bravo', 'admin', 'Líder del proyecto eMeet', 'Santiago'),
  ('00000000-0000-0000-0000-000000000002', 'Francisco Levipil', 'locatario', 'Organizador de eventos', 'Valparaíso'),
  ('00000000-0000-0000-0000-000000000003', 'Antonio Vivar', 'user', 'Usuario de prueba', 'Concepción')
on conflict (id) do nothing;

-- Sala de chat de prueba
insert into public.chat_rooms (id, event_title)
values ('room-test-001', 'Evento de Prueba eMeet')
on conflict (id) do nothing;

-- Miembros de la sala
insert into public.room_members (room_id, user_id)
values
  ('room-test-001', '00000000-0000-0000-0000-000000000001'),
  ('room-test-001', '00000000-0000-0000-0000-000000000002'),
  ('room-test-001', '00000000-0000-0000-0000-000000000003')
on conflict (room_id, user_id) do nothing;

-- Mensajes de prueba
insert into public.chat_messages (room_id, user_id, text)
values
  ('room-test-001', '00000000-0000-0000-0000-000000000001', 'Hola equipo, bienvenidos al chat de prueba!'),
  ('room-test-001', '00000000-0000-0000-0000-000000000002', 'Todo listo por acá.'),
  ('room-test-001', '00000000-0000-0000-0000-000000000003', 'Confirmado, sistema funcionando correctamente.');

-- Eventos guardados de prueba
insert into public.user_events (user_id, event_id, event_title, action)
values
  ('00000000-0000-0000-0000-000000000003', 'ext-event-001', 'Festival de Verano', 'like'),
  ('00000000-0000-0000-0000-000000000003', 'ext-event-002', 'Feria Gastronómica', 'save')
on conflict (user_id, event_id, action) do nothing;
