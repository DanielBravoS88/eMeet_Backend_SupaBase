# Plan de Aseguramiento de Calidad (QA) — Proyecto eMeet

---

## 1. Objetivo del QA

Garantizar que el sistema eMeet funcione correctamente según los requerimientos definidos, detectar defectos antes de la entrega académica, validar la seguridad de las rutas y la integridad de los datos, y asegurar una experiencia de usuario fluida en los flujos principales de la aplicación.

---

## 2. Alcance de las Pruebas

### Incluye:
- Flujo de autenticación (registro, login, logout, OAuth).
- Feed de descubrimiento (swipe, filtros, geolocalización).
- Sistema de guardados y likes.
- Chat comunitario en tiempo real.
- Panel de administrador (KPIs, gestión de eventos y usuarios).
- Panel de locatario (creación y eliminación de eventos).
- Protección de rutas por rol.
- Modo sin Supabase (fallback a localStorage).

### Excluye:
- Pruebas de carga o estrés (infraestructura).
- Pruebas de seguridad avanzada (penetration testing).
- Pruebas de accesibilidad WCAG (fuera del alcance actual).
- Repositorio `eMeet_Backend_Supabase` (se prueba su integración desde el frontend, no su código interno).

---

## 3. Tipos de Prueba

| Tipo | Descripción | Herramienta sugerida |
|---|---|---|
| **Pruebas funcionales manuales** | Verificar que cada funcionalidad opere según lo esperado | Manual (navegador) |
| **Pruebas de navegación** | Verificar que las rutas protegidas redirijan correctamente | Manual / Playwright |
| **Pruebas de integración** | Verificar la comunicación con Supabase y el backend | Manual / Postman |
| **Pruebas de regresión** | Verificar que cambios nuevos no rompan funcionalidades existentes | Manual |
| **Pruebas de compatibilidad** | Verificar el funcionamiento en diferentes navegadores y dispositivos | Manual (Chrome, Firefox, Safari, móvil) |
| **Pruebas de modo fallback** | Verificar que el modo sin Supabase (localStorage) funcione correctamente | Manual |

---

## 4. Casos de Prueba por Funcionalidad

### 4.1 Autenticación

| ID | Caso de prueba | Precondición | Pasos | Resultado esperado |
|---|---|---|---|---|
| AUTH-01 | Registro exitoso con email | Sin cuenta previa | 1. Ir a `/auth` → Crear cuenta. 2. Ingresar nombre, email válido, contraseña. 3. Enviar formulario. | Usuario creado, redirigido según rol o pantalla de verificación de email |
| AUTH-02 | Login exitoso con email | Cuenta existente | 1. Ir a `/auth`. 2. Ingresar email y contraseña correctos. 3. Enviar. | Sesión activa, redirigido según rol (`/`, `/admin`, `/locatario`) |
| AUTH-03 | Login con email incorrecto | Cualquiera | 1. Ingresar email no registrado. 2. Enviar. | Mensaje de error visible; sin redireccionamiento |
| AUTH-04 | Logout exitoso | Sesión activa | 1. Ir a `/profile`. 2. Hacer clic en "Cerrar sesión". | Sesión destruida, redirigido a `/auth` |
| AUTH-05 | Redirección de ruta protegida sin sesión | Sin sesión | 1. Acceder directamente a `/saved` o `/profile`. | Redirección automática a `/auth?next=/saved` |
| AUTH-06 | OAuth con Google | Sin sesión | 1. Clic en "Continuar con Google". | Redirigido al flujo OAuth de Google; al volver, sesión activa |
| AUTH-07 | Protección de ruta admin | Usuario con rol `user` | 1. Acceder a `/admin`. | Redirigido a `/` sin acceder al panel |
| AUTH-08 | Protección de ruta locatario | Usuario con rol `user` | 1. Acceder a `/locatario`. | Redirigido a `/` sin acceder al panel |

---

### 4.2 Feed de Descubrimiento

| ID | Caso de prueba | Precondición | Pasos | Resultado esperado |
|---|---|---|---|---|
| FEED-01 | Carga del feed con geolocalización | Sesión activa, API key de Google Maps | 1. Ir a `/`. 2. Conceder permiso de ubicación. | Tarjetas de lugares cercanos cargadas dentro de 5 segundos |
| FEED-02 | Swipe right (like) | Feed cargado | 1. Deslizar tarjeta hacia la derecha. | Tarjeta desaparece, toast verde, like registrado |
| FEED-03 | Swipe left (descartar) | Feed cargado | 1. Deslizar tarjeta hacia la izquierda. | Tarjeta desaparece, lugar excluido del feed |
| FEED-04 | Botón bookmark (guardar) | Feed cargado | 1. Hacer clic en el botón 🔖. | Lugar guardado, visible en `/saved` |
| FEED-05 | Filtro por tipo de lugar | Feed cargado | 1. Hacer clic en un chip de tipo (e.g., "Bar"). | El feed se actualiza mostrando solo bares cercanos |
| FEED-06 | Filtro de distancia | Feed cargado | 1. Ajustar el slider de distancia a 1 km. | El feed muestra solo lugares dentro del radio seleccionado |
| FEED-07 | Feed vacío | Todos descartados | 1. Descartar todos los lugares del feed. | Pantalla de "sin más lugares", opción de reiniciar |

---

### 4.3 Chat Comunitario

| ID | Caso de prueba | Precondición | Pasos | Resultado esperado |
|---|---|---|---|---|
| CHAT-01 | Unirse a una sala desde like | Lugar con like dado | 1. Dar like a un lugar. 2. Confirmar unirse al chat. | Sala creada/recuperada, usuario añadido como miembro |
| CHAT-02 | Enviar mensaje en sala | Sala abierta, sesión activa | 1. Escribir mensaje. 2. Hacer clic en Enviar. | Mensaje aparece al instante (actualización optimista) |
| CHAT-03 | Recibir mensaje en tiempo real | Dos usuarios en la misma sala | 1. Usuario A envía un mensaje. | Usuario B recibe el mensaje sin recargar la página |
| CHAT-04 | Contador de no leídos | Mensajes sin leer | 1. Recibir mensajes en una sala cerrada. 2. Ir a `/chat`. | Sala muestra contador de mensajes no leídos |
| CHAT-05 | Marcar sala como leída | Sala con mensajes no leídos | 1. Abrir la sala de chat. | El contador de no leídos se resetea a 0 |
| CHAT-06 | Chat en modo sin Supabase | Sin variables de entorno | 1. Enviar mensajes con Supabase desactivado. | Mensajes guardados en localStorage y visibles en la sesión |

---

### 4.4 Panel de Administrador

| ID | Caso de prueba | Precondición | Pasos | Resultado esperado |
|---|---|---|---|---|
| ADM-01 | Ver KPIs del dashboard | Sesión con rol admin | 1. Acceder a `/admin`. | KPIs cargados: total usuarios, eventos, comunidades, reportes |
| ADM-02 | Ver eventos recientes | Sesión con rol admin | 1. Revisar tabla de eventos en dashboard. | Lista de eventos con estado (live/draft/flagged) |
| ADM-03 | Acceso denegado para no admins | Sesión con rol user | 1. Intentar acceder a `/admin`. | Redirigido a `/` |

---

### 4.5 Panel de Locatario

| ID | Caso de prueba | Precondición | Pasos | Resultado esperado |
|---|---|---|---|---|
| LOC-01 | Crear evento nuevo | Sesión con rol locatario | 1. Completar formulario de evento. 2. Publicar. | Evento aparece en la lista de "Mis eventos" y en el feed general |
| LOC-02 | Eliminar evento propio | Evento existente, sesión locatario | 1. Hacer clic en 🗑 del evento. | Evento eliminado de la lista y del feed |
| LOC-03 | Formulario con campo vacío | Sesión locatario | 1. Intentar publicar evento sin título. | Mensaje de error de validación; sin envío |

---

## 5. Criterios de Aceptación

| Criterio | Descripción |
|---|---|
| Funcionalidad completa | Todos los casos de prueba P1 (alta prioridad) deben pasar sin errores bloqueantes |
| Sin errores críticos en consola | No deben aparecer errores de tipo en consola durante los flujos principales |
| Seguridad de rutas | Ningún usuario puede acceder a rutas de otro rol sin ser redirigido correctamente |
| Persistencia correcta | Los likes, guardados y mensajes deben persistir entre recargas de página |
| Tiempo de carga | El feed debe cargar en menos de 5 segundos con una conexión normal |
| Compatibilidad móvil | La interfaz debe ser usable en dispositivos móviles (pantallas ≥ 360px) |
| Fallback funcional | El sistema debe funcionar en modo local (localStorage) cuando Supabase no está configurado |

---

## 6. Evidencia Esperada

Para la entrega académica, se recomienda documentar la siguiente evidencia:

| Tipo de evidencia | Descripción |
|---|---|
| Capturas de pantalla | Cada pantalla principal en su estado funcional (feed, auth, chat, admin, locatario) |
| Video de flujo completo | Demostración del flujo: login → feed → like → chat → guardados → perfil → logout |
| Registro de casos de prueba | Tabla con resultado de cada caso (PASS / FAIL / BLOQUEADO) |
| Screenshots de consola limpia | Sin errores de JavaScript en flujos principales |
| Evidencia de Supabase | Dashboard mostrando datos reales en tablas (si hay acceso) |

---

## 7. Riesgos de QA

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Variables de entorno no configuradas en entorno de prueba | Alta | Alto | Usar archivo `.env.local` con valores reales para pruebas |
| Google Maps API key sin cuota disponible | Media | Alto | Verificar cuota antes de pruebas; usar modo fallback si es necesario |
| Supabase Realtime no disponible por red | Media | Medio | Probar en red estable; documentar si falla en entorno de prueba |
| Backend `eMeet_Backend_Supabase` no disponible | Media | Alto | Probar con modo local (localStorage) como alternativa |
| Compatibilidad en Safari iOS | Media | Medio | Probar en dispositivo iOS real o simulador |

---

## 8. Recomendaciones

1. **Automatizar pruebas E2E**: Implementar Playwright para los flujos críticos (login, swipe, chat) para detectar regresiones en futuros cambios.
2. **Agregar pruebas unitarias**: Usar Vitest para testear funciones puras como helpers de formato, adaptadores y validaciones.
3. **Configurar un entorno de staging**: Usar variables de entorno separadas para no contaminar datos de producción durante las pruebas.
4. **Revisar políticas RLS**: Verificar que las políticas de Row Level Security en Supabase impidan el acceso cruzado entre usuarios.
5. **Revisar exposición de API keys**: Mover la clave de Google Maps al BFF (Route Handler) para evitar exposición en el cliente.
6. **Documentar casos fallidos**: Registrar los casos que fallen durante QA con capturas de pantalla y pasos para reproducir, para su corrección antes de la entrega.
