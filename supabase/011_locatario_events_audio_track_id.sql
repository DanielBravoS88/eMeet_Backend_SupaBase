-- 011_locatario_events_audio_track_id.sql
--
-- Las URLs de preview de Deezer (audio_preview_url) son temporales: vienen
-- firmadas con un token `exp` que caduca a los pocos días/semanas, devolviendo
-- HTTP 403 y dejando los eventos sin música.
--
-- El ID del track en Deezer, en cambio, es permanente. Guardándolo podemos
-- re-resolver un preview fresco en el momento de reproducir (vía la ruta
-- /api/deezer/track del frontend), de modo que la música no vuelva a caducar.
--
-- Idempotente: seguro de re-ejecutar.

alter table public.locatario_events
  add column if not exists audio_track_id text;

comment on column public.locatario_events.audio_track_id is
  'ID estable de la canción en Deezer. Se usa para re-resolver un preview fresco '
  'cuando la URL temporal de audio_preview_url caduca.';
