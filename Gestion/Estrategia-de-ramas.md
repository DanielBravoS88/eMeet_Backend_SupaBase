# Estrategia de Ramas — Proyecto eMeet

---

## 1. Estructura de Ramas

El proyecto utiliza una estrategia de ramas basada en **GitFlow simplificado**, adaptada para un equipo académico de 3 personas.

```
main
  └── dev / develop         ← Rama de integración y desarrollo activo
        ├── feature/...     ← Ramas de funcionalidades nuevas
        ├── fix/...         ← Ramas de corrección de errores
        ├── hotfix/...      ← Correcciones urgentes a main
        └── documentation-and-delivery-structure  ← Documentación académica
```

---

## 2. Ramas Principales

### `main`

- **Propósito**: Rama de producción. Contiene el código estable y listo para despliegue.
- **Protegida**: No se debe hacer push directo. Solo se actualiza mediante Pull Requests revisados.
- **Despliegue**: Todo lo que llega a `main` debe poder desplegarse en producción.
- **Convención**: Los tags de versión se crean desde `main` (ej: `v1.0.0`, `v1.1.0`).

### `dev` / `develop`

> ⏳ **Verificar**: Esta rama fue inferida como la rama de desarrollo del proyecto. Confirmar el nombre exacto revisando las ramas activas en GitHub: `git branch -a`.

- **Propósito**: Rama de integración donde se unen los cambios del equipo antes de ir a `main`.
- **Estado**: En desarrollo activo. Contiene funcionalidades completadas pero no liberadas aún.
- **Regla**: Todos los Pull Requests de `feature/` deben apuntar a esta rama, no a `main`.

---

## 3. Ramas de Trabajo

### `feature/<nombre-de-la-funcionalidad>`

Para implementar nuevas funcionalidades:

```bash
# Crear desde dev
git checkout dev
git pull origin dev
git checkout -b feature/chat-realtime

# Trabajar...
git add .
git commit -m "feat: implementar chat con Supabase Realtime"

# Abrir PR hacia dev al finalizar
```

**Ejemplos de nombres**:
- `feature/auth-google-oauth`
- `feature/admin-panel-kpis`
- `feature/locatario-create-event`
- `feature/swipe-feed-google-places`

### `fix/<descripción-del-bug>`

Para corregir errores detectados durante el desarrollo:

```bash
git checkout dev
git checkout -b fix/auth-redirect-loop
```

### `hotfix/<descripción>`

Para correcciones urgentes que deben ir directamente a producción:

```bash
git checkout main
git checkout -b hotfix/security-middleware-bypass
# Merge a main Y a dev después
```

### `documentation-and-delivery-structure`

Rama creada para esta entrega académica. Contiene:
- `/Documentacion/` — Informe, Arquitectura, UML, MER, Wireframes, Gantt, Plan QA.
- `/Producto/` — Código fuente, dependencias, funcionalidades, scripts, ambiente local.
- `/Gestion/` — Definición, integrantes, ramas, infraestructura, backup, commits.
- Actualización del `README.md` raíz.

---

## 4. Flujo Recomendado de Pull Request

```
1. Crear rama desde dev:
   git checkout dev && git pull origin dev
   git checkout -b feature/nombre-funcionalidad

2. Desarrollar la funcionalidad con commits pequeños y descriptivos.

3. Antes de abrir el PR, actualizar la rama con dev:
   git fetch origin
   git rebase origin/dev
   (o git merge origin/dev si se prefiere merge)

4. Abrir Pull Request:
   - Título: claro y descriptivo
   - Base: dev (no main)
   - Descripción: qué se hizo, cómo probar, screenshots si es UI

5. Revisión por al menos 1 compañero del equipo.

6. Merge después de aprobación.

7. Eliminar la rama feature después del merge.
```

---

## 5. Convención de Mensajes de Commit

Seguir el estándar **Conventional Commits** (https://www.conventionalcommits.org/):

```
<tipo>(<ámbito opcional>): <descripción corta en presente>

[cuerpo opcional: qué y por qué]

[footer opcional: referencias a issues]
```

### Tipos de commit

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `style` | Cambios de formato/estilo sin afectar lógica |
| `refactor` | Refactorización sin cambio de funcionalidad |
| `test` | Pruebas |
| `chore` | Tareas de mantenimiento (deps, config) |
| `perf` | Mejoras de rendimiento |

### Ejemplos de mensajes de commit correctos

```bash
git commit -m "feat(auth): implementar login con Google OAuth"
git commit -m "fix(chat): corregir contador de mensajes no leídos"
git commit -m "docs: agregar wireframes y diagrama MER"
git commit -m "refactor(feed): extraer lógica de filtros a custom hook"
git commit -m "chore: actualizar dependencia framer-motion a v11.11.0"
```

### Mensajes de commit a evitar

```bash
# Demasiado vago
git commit -m "cambios"
git commit -m "update"
git commit -m "arreglos"
git commit -m "wip"

# Todo el trabajo en un solo commit
git commit -m "frontend completo terminado"
```

---

## 6. Buenas Prácticas de Commits

1. **Commits pequeños y frecuentes**: Un commit debe representar una unidad lógica de trabajo, no varios días de desarrollo.
2. **Un propósito por commit**: No mezclar una nueva funcionalidad con una corrección de bug en el mismo commit.
3. **Mensajes en presente**: "agregar validación" en lugar de "agregué validación" o "se agregó validación".
4. **Asociar cambios a integrantes**: Cada integrante debe hacer commits desde su propia cuenta de GitHub para que el historial refleje la participación individual.
5. **No subir código roto**: El código en cada commit debe al menos compilar sin errores.

---

## 7. Recomendación para No Subir Todo en un Solo Commit Final

Para evidenciar trabajo incremental (requerido académicamente), se recomienda:

1. Hacer commits al finalizar cada tarea pequeña: un componente, una función, una corrección.
2. Hacer push regularmente a la rama personal (al menos una vez por sesión de trabajo).
3. Evitar acumular trabajo local por días y subir todo junto.
4. Usar `git add -p` (modo patch) para hacer commits parciales de un archivo cuando se cambió más de una cosa.

---

## 8. Cómo Asociar Cambios a Integrantes del Equipo

1. Cada integrante debe tener configurado su usuario de Git correctamente:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

2. Los commits hechos desde cada cuenta apareceran asociados a ese usuario en el historial de GitHub.

3. Para revisar los commits de un integrante específico:

```bash
git log --author="Daniel Bravo" --oneline
```

---

## 9. Cómo Revisar el Historial de Commits en GitHub

- Ir al repositorio en GitHub → pestaña **"Commits"** (en la vista de la rama o del proyecto).
- Usar el filtro **"Author"** para ver commits por integrante.
- En la vista de un Pull Request, la pestaña **"Commits"** muestra todos los commits de ese PR.
- Usar el gráfico de contribuciones: GitHub → Insights → Contributors.

---

## 10. Revisión de Ramas Activas en el Repositorio

Para ver todas las ramas actuales del repositorio:

```bash
# Ramas locales
git branch

# Ramas remotas
git branch -r

# Todas (local + remota)
git branch -a
```

En GitHub: pestaña **"Code"** → desplegable de ramas (Branch selector).
