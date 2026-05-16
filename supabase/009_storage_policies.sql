-- eMeet: políticas de storage para buckets de eventos
-- Reemplaza cualquier política existente con una configuración correcta.
-- Ejecutar en el SQL Editor de Supabase.

-- ─── event-images ────────────────────────────────────────────────────────────

-- Limpiar políticas existentes (para evitar conflictos)
drop policy if exists "Public read event-images"          on storage.objects;
drop policy if exists "Authenticated upload event-images" on storage.objects;
drop policy if exists "Owner update event-images"         on storage.objects;
drop policy if exists "Owner delete event-images"         on storage.objects;

-- Cualquier visitante puede leer imágenes de eventos (bucket público)
create policy "Public read event-images"
  on storage.objects for select
  using ( bucket_id = 'event-images' );

-- Cualquier usuario autenticado (locatario) puede subir imágenes
create policy "Authenticated upload event-images"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'event-images' );

-- El dueño del archivo puede actualizarlo
create policy "Owner update event-images"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'event-images' AND owner = auth.uid() );

-- El dueño del archivo puede eliminarlo
create policy "Owner delete event-images"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'event-images' AND owner = auth.uid() );


-- ─── event-videos ─────────────────────────────────────────────────────────────

drop policy if exists "Public read event-videos"          on storage.objects;
drop policy if exists "Authenticated upload event-videos" on storage.objects;
drop policy if exists "Owner update event-videos"         on storage.objects;
drop policy if exists "Owner delete event-videos"         on storage.objects;

create policy "Public read event-videos"
  on storage.objects for select
  using ( bucket_id = 'event-videos' );

create policy "Authenticated upload event-videos"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'event-videos' );

create policy "Owner update event-videos"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'event-videos' AND owner = auth.uid() );

create policy "Owner delete event-videos"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'event-videos' AND owner = auth.uid() );
