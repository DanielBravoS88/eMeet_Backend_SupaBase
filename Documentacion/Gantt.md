# Carta Gantt — eMeet

> Este documento presenta la planificación temporal del proyecto eMeet. Un archivo visual (Excel, Notion, `.png`) puede colocarse en esta misma carpeta.

---

## Fases del proyecto

### Fase 1 — Análisis y diseño (Semanas 1–2)
| Tarea | Responsable | Estado |
|-------|-------------|--------|
| Levantamiento de requerimientos | Equipo | ✅ |
| Definición del stack tecnológico | Equipo | ✅ |
| Diseño del MER | Equipo | ✅ |
| Diseño de wireframes | Gustavo | ✅ |
| Definición de arquitectura | Daniel / Franco | ✅ |

### Fase 2 — Configuración del ambiente (Semana 2–3)
| Tarea | Responsable | Estado |
|-------|-------------|--------|
| Configuración de Supabase | Franco | ✅ |
| Setup del proyecto backend | Franco | ✅ |
| Setup del proyecto frontend | Gustavo | ✅ |
| Configuración de Prisma | Franco | ✅ |
| Deploy inicial en Render y Vercel | Daniel | ✅ |

### Fase 3 — Desarrollo del backend (Semanas 3–7)
| Tarea | Responsable | Estado |
|-------|-------------|--------|
| Módulo de autenticación | Antonio / Franco | ✅ |
| Módulo de perfiles | Daniel | ✅ |
| Módulo de eventos | Daniel / Franco | ✅ |
| Módulo de chat | Daniel | ✅ |
| Integración Google Places API | Daniel | ✅ |
| Módulo de administración | Franco | ✅ |
| Módulo de monetización | Antonio | ✅ |

### Fase 4 — Desarrollo del frontend (Semanas 4–8)
| Tarea | Responsable | Estado |
|-------|-------------|--------|
| Layout base y navegación | Gustavo | ✅ |
| Pantalla de autenticación | Gustavo | ✅ |
| Pantalla de eventos | Gustavo | ✅ |
| Pantalla de chat | Gustavo | ✅ |
| Pantalla de perfil | Gustavo | ✅ |
| Panel de locatario | Gustavo | ✅ |
| Panel de administración | Gustavo | ✅ |

### Fase 5 — Testing y QA (Semanas 8–9)
| Tarea | Responsable | Estado |
|-------|-------------|--------|
| Pruebas unitarias (middleware) | Daniel | ✅ |
| Pruebas de integración API | Equipo | 🔄 |
| Pruebas de interfaz | Gustavo | 🔄 |
| Corrección de bugs | Equipo | 🔄 |

### Fase 6 — Documentación y entrega (Semanas 9–10)
| Tarea | Responsable | Estado |
|-------|-------------|--------|
| Redacción del informe | Equipo | 🔄 |
| Documentación de API | Daniel | 🔄 |
| Organización de carpetas académicas | Daniel | 🔄 |
| Entrega final | Equipo | 🔄 |

---

## Representación temporal (diagrama de barras simplificado)

```
Tarea                          S1  S2  S3  S4  S5  S6  S7  S8  S9  S10
─────────────────────────────────────────────────────────────────────────
Análisis y diseño              ████
Config. ambiente                   ████
Backend - Auth                         ████
Backend - Perfiles                         ████
Backend - Eventos                          ████
Backend - Chat                                 ████
Backend - Admin                                    ████
Backend - Monetización                                 ████
Frontend                               ████████████████
Testing y QA                                               ████
Documentación y entrega                                        ████████
─────────────────────────────────────────────────────────────────────────
```

**Leyenda**: ✅ Completado | 🔄 En progreso | ⬜ Pendiente
