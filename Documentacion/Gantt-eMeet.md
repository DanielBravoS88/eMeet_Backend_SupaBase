# Carta Gantt — Proyecto eMeet

## Información del proyecto

| Campo         | Detalle                                      |
|---------------|----------------------------------------------|
| Proyecto      | eMeet — Plataforma social de eventos         |
| Repositorios  | Frontend + Backend (GitHub)                  |
| Despliegue    | Vercel (frontend) + Render (backend)         |

---

## Planificación de fases

| Fase | Actividad                            | Responsable(s)              | Estado       |
|------|--------------------------------------|-----------------------------|--------------|
| 1    | Diseño de arquitectura y BD          | Daniel, Franco              | ✅ Completado |
| 2    | Configuración Supabase y esquema SQL | Franco, Daniel              | ✅ Completado |
| 3    | Autenticación (registro/login)       | Antonio, Franco             | ✅ Completado |
| 4    | Módulo de perfil de usuario          | Antonio                     | ✅ Completado |
| 5    | Módulo de eventos (CRUD)             | Franco, Daniel              | ✅ Completado |
| 6    | Módulo de chat en tiempo real        | Daniel                      | ✅ Completado |
| 7    | Integración Google Maps Places API   | Daniel                      | ✅ Completado |
| 8    | Módulo de administración/moderación  | Franco, Antonio             | ✅ Completado |
| 9    | Módulo de monetización               | Antonio                     | ✅ Completado |
| 10   | Despliegue en Render                 | Daniel                      | ✅ Completado |
| 11   | Frontend — diseño e integración      | Daniel, Gustavo             | ✅ Completado |
| 12   | Despliegue frontend en Vercel        | Daniel                      | ✅ Completado |
| 13   | Testing y QA                         | Todos                       | 🔄 En curso  |
| 14   | Documentación académica              | Todos                       | 🔄 En curso  |

---

## Diagrama de Gantt simplificado

```
Actividad                             Sem1  Sem2  Sem3  Sem4  Sem5  Sem6  Sem7  Sem8
─────────────────────────────────────────────────────────────────────────────────────
Diseño arquitectura y BD              ████
Config. Supabase y esquema SQL        ████  ██
Autenticación                               ████
Módulo perfil                               ████
Módulo eventos                              ████  ████
Módulo chat realtime                              ████
Google Maps Places                                ████
Admin / moderación                                      ████
Monetización                                            ████  ████
Despliegue backend (Render)                                   ████
Frontend integración y diseño               ████  ████  ████  ████  ████
Despliegue frontend (Vercel)                                        ████
Testing y QA                                                        ████  ████
Documentación académica                                                   ████
```

---

## Hitos principales

| Hito                              | Descripción                                          |
|-----------------------------------|------------------------------------------------------|
| ✅ MVP Backend                    | API funcional con auth, perfil, eventos y chat       |
| ✅ MVP Frontend                   | Interfaz funcional integrada con el backend          |
| ✅ Despliegue en producción       | Render + Vercel + Supabase operativos                |
| 🔄 Documentación completa         | Estructura académica completa en GitHub              |
| 🔄 QA formal                      | Cobertura de pruebas ampliada                        |
