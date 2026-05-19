# Planificación Gantt — Proyecto eMeet

> Las fechas indicadas son **estimadas** y deben ser validadas y ajustadas por el equipo de desarrollo. Este documento se basa en el análisis del estado actual del repositorio `eMeet_frontend` y la evidencia de trabajo detectada.

---

## 1. Etapas del Proyecto

| N° | Etapa | Descripción |
|---|---|---|
| 1 | Análisis y diseño | Definición del problema, arquitectura, wireframes y modelo de datos |
| 2 | Configuración inicial | Setup del repositorio, dependencias, estructura base y entornos |
| 3 | Desarrollo frontend core | Componentes base, autenticación, feed de swipe y navegación |
| 4 | Integración Google Maps | Geolocalización, Places API, mapa interactivo |
| 5 | Integración Supabase | Auth real, base de datos, tiempo real (chat) |
| 6 | Paneles por rol | Panel de administrador y panel de locatario |
| 7 | Integración backend | Conexión con `eMeet_Backend_Supabase`, endpoints REST |
| 8 | Pruebas y QA | Pruebas funcionales, revisión de seguridad, correcciones |
| 9 | Documentación | Informe académico, arquitectura, UML, MER, wireframes, Gantt |
| 10 | Entrega final | Revisión final, PR a `main`, preparación de entrega académica |

---

## 2. Diagrama Gantt (Mermaid)

```mermaid
gantt
    title Planificación del Proyecto eMeet
    dateFormat  YYYY-MM-DD
    axisFormat  %d/%m

    section Análisis y Diseño
    Definición del problema           :done,    ana1, 2026-03-01, 5d
    Arquitectura del sistema          :done,    ana2, 2026-03-04, 4d
    Wireframes y flujos               :done,    ana3, 2026-03-06, 4d
    Modelo de datos conceptual        :done,    ana4, 2026-03-08, 3d

    section Configuración Inicial
    Setup Next.js 14 + TypeScript     :done,    cfg1, 2026-03-10, 2d
    Tailwind + Framer Motion          :done,    cfg2, 2026-03-11, 2d
    Configuración Supabase            :done,    cfg3, 2026-03-12, 2d
    Estructura de carpetas            :done,    cfg4, 2026-03-13, 1d

    section Frontend Core
    AuthContext + AuthPage            :done,    fe1, 2026-03-15, 4d
    Tipos TypeScript centrales        :done,    fe2, 2026-03-16, 2d
    Layout + BottomNavBar             :done,    fe3, 2026-03-18, 3d
    SwipeCard + Feed principal        :done,    fe4, 2026-03-20, 5d
    SearchPage + SavedPage            :done,    fe5, 2026-03-24, 4d
    ProfilePage                       :done,    fe6, 2026-03-26, 3d

    section Google Maps
    Integración @react-google-maps    :done,    gm1, 2026-03-28, 3d
    NearbyPlacesContext               :done,    gm2, 2026-03-30, 4d
    BellavistaMap + LocationPickerMap :done,    gm3, 2026-04-02, 4d
    PlaceTypeFilters + DistanceFilter :done,    gm4, 2026-04-04, 3d

    section Integración Supabase
    Supabase Auth (email + OAuth)     :done,    sb1, 2026-04-07, 5d
    Middleware de rutas y roles       :done,    sb2, 2026-04-09, 3d
    ChatContext + Supabase Realtime   :done,    sb3, 2026-04-12, 6d
    LocatarioEventsContext            :done,    sb4, 2026-04-16, 4d

    section Paneles por Rol
    Panel de administrador (/admin)   :done,    adm1, 2026-04-20, 6d
    AdminShell + KpiCard + Charts     :done,    adm2, 2026-04-22, 4d
    Panel de locatario (/locatario)   :done,    loc1, 2026-04-26, 5d
    ImageUpload + VideoUpload         :done,    loc2, 2026-04-28, 3d

    section Integración Backend
    Route Handlers / API (admin+deezer):done,    bff1, 2026-04-30, 4d
    fetchApi helper + authSession     :done,    bff2, 2026-05-01, 2d
    Conexión con eMeet_Backend_SupaBase:done,   bff3, 2026-05-03, 7d

    section QA y Pruebas
    Pruebas funcionales manuales      :active,  qa1, 2026-05-05, 5d
    Revisión de seguridad             :active,  qa2, 2026-05-08, 3d
    Correcciones detectadas           :active,  qa3, 2026-05-10, 4d

    section Documentación
    Informe académico                 :done,    doc1, 2026-05-05, 4d
    Arquitectura y UML                :done,    doc2, 2026-05-06, 3d
    MER + Wireframes                  :done,    doc3, 2026-05-07, 2d
    Gantt + Plan QA                   :done,    doc4, 2026-05-07, 2d
    Gestion y estructura de entrega   :done,    doc5, 2026-05-07, 2d

    section Entrega Final
    Revisión final del PR             :done,    ent1, 2026-05-12, 2d
    PR hacia main/dev                 :done,    ent2, 2026-05-13, 1d
    Entrega académica                 :milestone, ent3, 2026-05-14, 0d
```

---

## 3. Tabla de Actividades

| Etapa | Actividad | Responsable | Inicio estimado | Fin estimado | Estado |
|---|---|---|---|---|---|
| Análisis | Definición del problema y alcance | Equipo | 01/03/2026 | 05/03/2026 | ✅ Completado |
| Análisis | Arquitectura del sistema | Equipo | 04/03/2026 | 07/03/2026 | ✅ Completado |
| Análisis | Wireframes y flujos de usuario | Equipo | 06/03/2026 | 09/03/2026 | ✅ Completado |
| Configuración | Setup del proyecto Next.js 14 | Daniel Bravo | 10/03/2026 | 11/03/2026 | ✅ Completado |
| Configuración | Configuración Supabase y variables de entorno | Francisco Levipil | 12/03/2026 | 13/03/2026 | ✅ Completado |
| Frontend | AuthContext + página de autenticación | Antonio Vivar | 15/03/2026 | 18/03/2026 | ✅ Completado |
| Frontend | SwipeCard + Feed principal | Daniel Bravo | 20/03/2026 | 24/03/2026 | ✅ Completado |
| Frontend | SearchPage + SavedPage + ProfilePage | Equipo | 24/03/2026 | 28/03/2026 | ✅ Completado |
| Google Maps | Integración Places API + NearbyPlacesContext | Francisco Levipil | 28/03/2026 | 05/04/2026 | ✅ Completado |
| Supabase | Auth real (email + OAuth Google/Apple) | Antonio Vivar | 07/04/2026 | 11/04/2026 | ✅ Completado |
| Supabase | Chat en tiempo real (Realtime) | Daniel Bravo | 12/04/2026 | 17/04/2026 | ✅ Completado |
| Paneles | Panel de administrador completo | Francisco Levipil | 20/04/2026 | 25/04/2026 | ✅ Completado |
| Paneles | Panel de locatario + formulario de evento | Antonio Vivar | 26/04/2026 | 30/04/2026 | ✅ Completado |
| Backend | Integración con eMeet_Backend_SupaBase | Equipo | 30/04/2026 | 06/05/2026 | ✅ Completado |
| QA | Pruebas funcionales manuales | Equipo | 05/05/2026 | 09/05/2026 | 🔄 En progreso |
| QA | Revisión de seguridad y correcciones | Equipo | 08/05/2026 | 13/05/2026 | 🔄 En progreso |
| Documentación | Estructura académica completa | Equipo | 05/05/2026 | 08/05/2026 | ✅ Completado |
| Entrega | PR hacia `main`/`dev` + entrega académica | Equipo | 12/05/2026 | 16/05/2026 | ✅ Completado |

---

## 4. Leyenda de Estado

| Símbolo | Estado |
|---|---|
| ✅ | Completado |
| 🔄 | En progreso |
| ⏳ | Pendiente |
| ❌ | Bloqueado |

---

## 5. Nota de Validación

> ⚠️ Las fechas y responsables específicos de este Gantt son **estimaciones** basadas en el análisis del repositorio y deben ser validadas y ajustadas por el equipo de desarrollo (Daniel Bravo, Francisco Levipil, Antonio Vivar) según las fechas reales de trabajo y los plazos académicos oficiales del curso.
