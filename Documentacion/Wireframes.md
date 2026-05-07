# Wireframes — eMeet

> Este documento describe los wireframes principales de la interfaz de eMeet. Los archivos de diseño (Figma, `.png`, `.pdf`) deben colocarse en esta misma carpeta cuando estén disponibles.

---

## Pantallas principales

### 1. Pantalla de inicio / Landing
```
┌─────────────────────────────────────────┐
│  [Logo eMeet]          [Login] [Register]│
├─────────────────────────────────────────┤
│                                         │
│   Encuentra eventos cerca de ti         │
│                                         │
│   [🔍 Buscar eventos...]   [Buscar]     │
│                                         │
│   ┌──────────┐ ┌──────────┐ ┌────────┐ │
│   │ Evento 1 │ │ Evento 2 │ │Evento 3│ │
│   │ img      │ │ img      │ │ img    │ │
│   │ Título   │ │ Título   │ │Título  │ │
│   │ Fecha    │ │ Fecha    │ │Fecha   │ │
│   │ [Like]   │ │ [Like]   │ │[Like]  │ │
│   └──────────┘ └──────────┘ └────────┘ │
└─────────────────────────────────────────┘
```

### 2. Detalle de evento
```
┌─────────────────────────────────────────┐
│  ← Volver             [❤ Like] [★ Save]│
├─────────────────────────────────────────┤
│  [Imagen del evento]                    │
│                                         │
│  Título del evento                      │
│  📅 Fecha y hora                        │
│  📍 Ubicación en mapa                   │
│  💵 Precio                              │
│                                         │
│  Descripción del evento...              │
│                                         │
│  Organizador: @nombre                   │
│                                         │
│  [Unirse al chat]   [Comprar ticket]    │
└─────────────────────────────────────────┘
```

### 3. Sala de chat
```
┌─────────────────────────────────────────┐
│  ← Volver    Sala: [Nombre del evento]  │
├─────────────────────────────────────────┤
│                                         │
│  Usuario1: Hola a todos!          10:30 │
│  Usuario2: ¿A qué hora empieza?   10:31 │
│  Tú: Según dice las 20:00         10:32 │
│                                         │
│  ...                                    │
│                                         │
├─────────────────────────────────────────┤
│  [Escribe un mensaje...       ] [Enviar]│
└─────────────────────────────────────────┘
```

### 4. Perfil de usuario
```
┌─────────────────────────────────────────┐
│  [Avatar]   @usuario                    │
│             Bio del usuario             │
│             Intereses: [música] [arte]  │
│             [Editar perfil]             │
├─────────────────────────────────────────┤
│  Mis eventos guardados                  │
│  ┌──────────┐ ┌──────────┐             │
│  │ Evento A │ │ Evento B │             │
│  └──────────┘ └──────────┘             │
│                                         │
│  Mis likes                              │
│  ┌──────────┐ ┌──────────┐             │
│  │ Evento C │ │ Evento D │             │
│  └──────────┘ └──────────┘             │
└─────────────────────────────────────────┘
```

### 5. Panel de locatario — Mis eventos
```
┌─────────────────────────────────────────┐
│  Panel Locatario         [+ Nuevo Evento]│
├─────────────────────────────────────────┤
│  Mis eventos                            │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ Título  │ Fecha  │ Estado │ Acciones│ │
│  ├─────────┼────────┼────────┼────────┤ │
│  │ Rock Fest│ 15/06 │ Pub    │ [✏][🗑]│ │
│  │ Jazz Noche│ 20/06│ Draft  │ [✏][🗑]│ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 6. Panel de administración
```
┌─────────────────────────────────────────┐
│  Panel Admin                            │
├─────────────────────────────────────────┤
│  KPIs                                   │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ GMV      │ │ Revenue  │ │ Tickets │ │
│  │ $12,500  │ │ $1,250   │ │   87    │ │
│  └──────────┘ └──────────┘ └─────────┘ │
├─────────────────────────────────────────┤
│  Reportes pendientes                    │
│  ┌────────────────────────────────────┐ │
│  │ Tipo  │ Descripción │ Estado       │ │
│  ├───────┼─────────────┼─────────────┤ │
│  │ spam  │ Evento falso│ [Resolver]  │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Notas de diseño
- Diseño mobile-first con Tailwind CSS.
- Paleta de colores: definida en el repositorio frontend.
- Los archivos de diseño en alta fidelidad (Figma) se adjuntan cuando estén disponibles.
