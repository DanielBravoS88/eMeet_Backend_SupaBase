# Infraestructura Cloud — Proyecto eMeet

> Este documento describe la infraestructura cloud del proyecto eMeet, basada en el análisis del repositorio `eMeet_frontend` y las integraciones detectadas en el código fuente.

---

## 1. Resumen del Stack de Infraestructura

| Componente | Plataforma | Estado |
|---|---|---|
| **Frontend** (`eMeet_frontend`) | Vercel (sugerido) | ⏳ Pendiente de validar |
| **Backend** (`eMeet_Backend_Supabase`) | Pendiente de validar | ⏳ Pendiente |
| **Base de datos** | Supabase PostgreSQL | ✅ Configurado |
| **Autenticación** | Supabase Auth | ✅ Configurado |
| **Tiempo real** | Supabase Realtime | ✅ Configurado |
| **Almacenamiento de archivos** | Supabase Storage | ✅ Configurado |
| **Servicio de mapas** | Google Maps Platform | ✅ Integrado en frontend |

---

## 2. Frontend — `eMeet_frontend`

### Plataforma sugerida: Vercel

El repositorio `eMeet_frontend` usa Next.js 14, el cual es desarrollado por Vercel y tiene integración nativa con esa plataforma. No se detectó configuración de Vercel (`vercel.json`) en el repositorio, pero es la opción más coherente y recomendada.

> ⏳ **Pendiente por validar**: si el frontend ya está desplegado en Vercel u otra plataforma.

### Proceso de despliegue sugerido en Vercel:

1. Conectar el repositorio `DanielBravoS88/eMeet_frontend` a Vercel.
2. Configurar las variables de entorno en Vercel (Settings → Environment Variables).
3. Seleccionar la rama `main` como rama de producción.
4. Vercel detecta automáticamente Next.js y configura el build con `npm run build`.
5. Cada Push a `main` dispara un despliegue automático.
6. Los Pull Requests generan Preview URLs automáticamente.

### Comando de build detectado:

```bash
npm run build
# → next build (compilación TypeScript + generación estática + SSR)
```

---

## 3. Backend — `eMeet_Backend_Supabase`

> ⏳ **Pendiente por validar**: El repositorio `eMeet_Backend_Supabase` no estuvo disponible para análisis. La plataforma de despliegue del backend debe confirmarse con el equipo.

### Opciones de despliegue detectadas o sugeridas:

| Opción | Descripción |
|---|---|
| **Vercel** | Si el backend está implementado como Next.js API Routes o Route Handlers |
| **Render** | Plataforma cloud simple para APIs Node.js/Express/Fastify |
| **Railway** | Plataforma cloud para backends con base de datos |
| **Supabase Edge Functions** | Funciones serverless dentro del propio proyecto Supabase |

---

## 4. Supabase — Plataforma Backend Principal

**URL del proyecto**: https://supabase.com/dashboard/project/ksghpwonmnxmbhmfpaog

| Servicio | Estado | Detalle |
|---|---|---|
| **PostgreSQL** | ✅ Activo | Base de datos relacional del sistema |
| **Auth** | ✅ Activo | Autenticación con email, Google, Apple |
| **Realtime** | ✅ Activo | WebSockets para chat en tiempo real |
| **Storage** | ✅ Activo | Imágenes y videos de perfil y eventos |
| **Edge Functions** | ⏳ No confirmado | Podría usarse para lógica serverless en backend |

### Plan de Supabase recomendado:

| Plan | Descripción | Adecuado para |
|---|---|---|
| **Free** | Hasta 500 MB de DB, 1 GB de storage, 2 proyectos | Desarrollo y MVP académico |
| **Pro** | USD 25/mes, recursos aumentados, backups diarios | Producción real |

> Para la entrega académica, el plan gratuito es suficiente. Para producción, se recomienda el plan Pro para garantizar backups automáticos y mayor capacidad.

---

## 5. Google Maps Platform

| Servicio | Uso | Estado |
|---|---|---|
| **Maps JavaScript API** | Mapa interactivo (`BellavistaMap`, `LocationPickerMap`) | ✅ Integrado |
| **Places API** | Búsqueda de lugares cercanos (`useNearbyPlaces`) | ✅ Integrado |

**Variable de entorno**:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

> ⚠️ La API key está actualmente expuesta en el cliente (prefijo `NEXT_PUBLIC_`). Se recomienda mover las consultas a Google Places a un Route Handler del BFF para proteger la clave y controlar el consumo.

---

## 6. Variables de Entorno por Ambiente

### Ambiente de desarrollo (`.env.local`)

| Variable | Descripción | Notas |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | No incluir en repositorio |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | No incluir en repositorio |
| `NEXT_PUBLIC_BACKEND_URL` | URL del backend REST | No incluir en repositorio |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Clave de Google Maps | No incluir en repositorio |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role (solo servidor) | No incluir en repositorio |

### Ambiente de producción (Vercel → Settings → Environment Variables)

Las mismas variables deben configurarse en la plataforma de despliegue. En Vercel:
1. Ir a: Project Settings → Environment Variables.
2. Agregar cada variable con su valor real.
3. Seleccionar los entornos donde aplica: Production, Preview, Development.

---

## 7. Procedimiento de Despliegue Sugerido

### Frontend en Vercel

```
1. Hacer merge del PR a main (o dev, según la etapa).
2. Vercel detecta el push automáticamente.
3. Ejecuta: npm run build
4. Si el build es exitoso, despliega la nueva versión.
5. Verificar en la URL de producción que todo funciona.
6. En caso de error: revisar los logs de build en el dashboard de Vercel.
```

### Verificación post-despliegue

- [ ] La página raíz carga correctamente.
- [ ] El login con email funciona.
- [ ] El feed de swipe carga lugares (con API key de Google Maps).
- [ ] El chat en tiempo real funciona (con Supabase configurado).
- [ ] Las rutas protegidas redirigen correctamente.
- [ ] Las variables de entorno están configuradas en producción.

---

## 8. Ambiente de Pruebas (Staging)

> ⏳ **Pendiente por validar**: si existe un ambiente de staging separado.

**Recomendación**: Usar las Preview URLs de Vercel (generadas automáticamente en cada PR) como ambiente de staging. Configurar un proyecto Supabase separado para pruebas si es posible.

---

## 9. Evidencia Requerida para Entrega Académica

| Evidencia | Descripción |
|---|---|
| Captura del dashboard de Supabase | Mostrar las tablas con datos reales |
| Captura del proyecto en Vercel | Mostrar el despliegue exitoso (si aplica) |
| URL de la aplicación desplegada | URL pública de la app en producción o staging |
| Variables de entorno configuradas | Captura de la configuración (sin mostrar los valores) |
| Historial de deploys | Captura del historial de deployments en Vercel |

---

## 10. Información Pendiente por Validar

| Elemento | Estado |
|---|---|
| Plataforma de despliegue del backend | ⏳ Pendiente — requiere acceso a `eMeet_Backend_Supabase` |
| URL pública de la aplicación en producción | ⏳ Pendiente |
| Configuración de dominio personalizado | ⏳ Pendiente |
| CI/CD configurado (GitHub Actions, etc.) | ⏳ Pendiente — no detectado en `eMeet_frontend` |
| Ambiente de staging separado | ⏳ Pendiente |
| Plan de Supabase activo (Free vs Pro) | ⏳ Pendiente — verificar en dashboard |
