# Ambiente Local — eMeet Frontend

---

## 1. Requisitos Previos

Antes de levantar el proyecto en ambiente local, asegúrese de tener instaladas las siguientes herramientas:

| Herramienta | Versión mínima recomendada | Verificación |
|---|---|---|
| **Node.js** | 18.x LTS (recomendado: 20.x o 22.x) | `node -v` |
| **npm** | 9.x o superior (incluido con Node.js) | `npm -v` |
| **Git** | 2.x | `git --version` |
| Navegador web moderno | Chrome 120+, Firefox 120+, Safari 17+ | — |

> El proyecto usa `npm` como gestor de paquetes (confirmado por `package-lock.json`). No se requiere pnpm, yarn ni bun.

---

## 2. Clonar el Repositorio

```bash
git clone https://github.com/DanielBravoS88/eMeet_frontend.git
cd eMeet_frontend
```

---

## 3. Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias definidas en `package.json` en la carpeta `node_modules/`.

---

## 4. Configurar Variables de Entorno

El proyecto requiere un archivo `.env.local` en la raíz del repositorio. Este archivo **no está incluido en el repositorio** (está en `.gitignore`) por razones de seguridad.

### 4.1 Crear el archivo de variables de entorno

```bash
# Opción A: copiar desde el template si existe
cp .env.example .env.local

# Opción B: crear el archivo manualmente
touch .env.local
```

### 4.2 Variables de entorno detectadas en el código

Edite `.env.local` y complete los valores correspondientes. Los nombres de las variables fueron detectados directamente en el código fuente del repositorio.

```env
# ─── Supabase ──────────────────────────────────────────────────────────────
# URL del proyecto Supabase (detectada en src/lib/supabase.ts)
NEXT_PUBLIC_SUPABASE_URL=

# Clave anónima de Supabase (detectada en src/lib/supabase.ts)
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# ─── Backend eMeet_Backend_Supabase ────────────────────────────────────────
# URL base del backend REST (detectada en AuthContext.tsx, ChatContext.tsx, etc.)
NEXT_PUBLIC_BACKEND_URL=

# ─── Google Maps Platform ──────────────────────────────────────────────────
# Clave de API para Google Maps JavaScript API + Places API
# (detectada en NearbyPlacesContext.tsx y GoogleMapsProvider.tsx)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# ─── Opcionales ────────────────────────────────────────────────────────────
# Timeout en ms para llamadas a Places API (detectada en placesService.ts)
# NEXT_PUBLIC_PLACES_TIMEOUT_MS=9000

# Timeout en ms para llamadas al backend desde Route Handlers (detectada en api/admin/stats/route.ts)
# BACKEND_FETCH_TIMEOUT_MS=10000

# Clave de servicio de Supabase — SOLO USO EN SERVIDOR (no debe comenzar con NEXT_PUBLIC_)
# SUPABASE_SERVICE_ROLE_KEY=
```

> ⚠️ **Importante**:
> - **No incluya valores reales de estas variables en el repositorio.**
> - Las variables con prefijo `NEXT_PUBLIC_` son visibles en el navegador.
> - `SUPABASE_SERVICE_ROLE_KEY` y `BACKEND_FETCH_TIMEOUT_MS` solo deben usarse en el servidor.
> - Sin `NEXT_PUBLIC_SUPABASE_URL` configurado, el sistema operará en **modo local** (localStorage), lo cual es suficiente para desarrollo básico.

### 4.3 Cómo obtener los valores

| Variable | Cómo obtener el valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard de Supabase → Proyecto → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard de Supabase → Proyecto → Settings → API → anon/public key |
| `NEXT_PUBLIC_BACKEND_URL` | URL donde está desplegado `eMeet_Backend_Supabase` (p.ej. `https://api.emeet.cl`) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Cloud Console → APIs & Services → Credentials |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard de Supabase → Proyecto → Settings → API → service_role key |

---

## 5. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

El servidor de desarrollo utiliza **Turbopack** (opción `--turbo` en Next.js 14), lo que proporciona arranque ultra rápido y Hot Module Replacement (HMR) instantáneo.

---

## 6. Construir el Proyecto (Build de Producción)

```bash
npm run build
```

Este comando:
1. Ejecuta la compilación TypeScript.
2. Genera el build optimizado de Next.js en la carpeta `.next/`.
3. Reporta errores de tipos y advertencias de rendimiento.

Para iniciar el servidor de producción:

```bash
npm start
```

El servidor de producción estará disponible en: **http://localhost:3000**

---

## 7. Modos de Operación

El proyecto detecta automáticamente si las variables de Supabase están configuradas:

| Modo | Condición | Comportamiento |
|---|---|---|
| **Modo completo** | `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurados | Auth real, chat persistente, guardados en DB |
| **Modo local** | Sin variables de Supabase | Auth simulada con localStorage, chat local, sin persistencia entre dispositivos |

> En **modo local**, puede iniciar sesión con cualquier email y contraseña. El rol se infiere del email: `admin@` → admin, `locatario@` → locatario, cualquier otro → user.

---

## 8. Verificar que Todo Funciona

1. Acceder a `http://localhost:3000` → debe redirigir a `/auth`.
2. Iniciar sesión con `user@test.com` / cualquier contraseña (modo local).
3. Conceder permiso de geolocalización → deben aparecer tarjetas de lugares (si hay Google Maps key configurada).
4. Navegar por las rutas: `/search`, `/saved`, `/profile`, `/chat`.

---

## 9. Problemas Frecuentes

### El servidor no inicia: "Error: Cannot find module..."

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### La página queda en loading infinito

- Verificar que `NEXT_PUBLIC_SUPABASE_URL` sea una URL válida (no un placeholder).
- Si no se tiene acceso a Supabase, dejar la variable vacía para activar el modo local.

### No aparecen lugares en el feed

- Verificar que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` esté configurada.
- Verificar que la API key tenga habilitadas: **Maps JavaScript API** y **Places API**.
- Verificar que el navegador tenga permiso de geolocalización para `localhost`.

### Error "NEXT_PUBLIC_BACKEND_URL no está configurada"

- Esta variable es requerida para las funcionalidades que dependen del backend `eMeet_Backend_Supabase`.
- Si no se tiene el backend disponible, el sistema operará en modo local para las funciones que lo soporten.

### Error de TypeScript al compilar

```bash
# Verificar errores de tipo
npx tsc --noEmit
```

### El build falla con "Module not found"

- Verificar que las rutas de importación sean correctas (sensibles a mayúsculas/minúsculas en Linux).
- Ejecutar `npm install` para asegurarse de que todas las dependencias estén instaladas.

---

## 10. Notas Adicionales

- El archivo `.next/` (build) no debe subirse al repositorio (está en `.gitignore`).
- El archivo `node_modules/` tampoco debe subirse al repositorio.
- El archivo `.env.local` **nunca debe subirse al repositorio**; está en `.gitignore`.
- Para contribuir al proyecto, crear una rama desde `main` o `dev/develop` y abrir un Pull Request.
