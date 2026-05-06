# Base de Datos — eMeet

Carpeta con scripts SQL para el despliegue y pruebas del sistema.

## Archivos

| Archivo | Descripción | Orden de ejecución |
|---------|-------------|-------------------|
| [Script-BD.sql](Script-BD.sql) | Esquema completo: tablas, índices, RLS, trigger, Realtime, Storage | 1° |
| [Procedimientos-Almacenados.sql](Procedimientos-Almacenados.sql) | Funciones PL/pgSQL (`handle_new_user`, `get_unread_count`, etc.) | 2° |
| [Datos-Prueba.sql](Datos-Prueba.sql) | Seed data para ambiente de desarrollo/testing | 3° (solo dev) |

## Instrucciones

1. Abrir Supabase Dashboard → SQL Editor.
2. Ejecutar los archivos en el orden indicado.
3. Verificar que las tablas `profiles`, `chat_rooms`, `room_members`, `chat_messages` existan.
4. En producción, **no ejecutar** `Datos-Prueba.sql`.
