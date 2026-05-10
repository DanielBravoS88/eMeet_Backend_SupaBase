# Registro de Commits — Guía de Trabajo Incremental

---

## 1. ¿Qué se Espera del Historial de Commits?

Para la entrega académica del proyecto eMeet, el historial de commits debe demostrar:

- **Trabajo incremental**: cambios pequeños y frecuentes, no un solo commit final gigante.
- **Participación individual**: cada integrante debe tener commits asociados a su cuenta de GitHub.
- **Progresión lógica**: el historial debe reflejar la evolución del proyecto (configuración → componentes → integración → pruebas → documentación).
- **Mensajes claros**: los mensajes deben describir qué se hizo y en qué parte del sistema.
- **Diversidad de áreas**: cada integrante debe haber contribuido en diferentes partes del código.

---

## 2. Ejemplos de Mensajes de Commit Correctos

### Formato Conventional Commits

```
<tipo>(<ámbito>): <descripción breve en presente>
```

### Ejemplos por tipo:

```bash
# Nuevas funcionalidades
feat(auth): implementar login con email y contraseña usando Supabase Auth
feat(feed): agregar stack de tarjetas con mecánica de swipe (Framer Motion)
feat(chat): conectar ChatContext con Supabase Realtime para mensajes en tiempo real
feat(admin): crear panel de administración con KPIs y gráficos Recharts
feat(locatario): implementar formulario de creación de eventos con ImageUpload
feat(profile): agregar edición de intereses con chips seleccionables

# Correcciones
fix(auth): corregir loop de redirección en middleware cuando el token expira
fix(chat): resolver error al enviar mensaje con texto vacío
fix(feed): corregir filtro de distancia que no actualizaba el feed correctamente

# Estilos y UI
style(swipe-card): ajustar border-radius y sombra en tarjetas del feed
style(navbar): mejorar contraste de iconos en bottom navigation bar

# Refactorización
refactor(auth-context): extraer helpers de localStorage a funciones independientes
refactor(nearby-places): eliminar polling de 8 segundos, reemplazar con Realtime

# Documentación
docs: agregar README principal del proyecto con stack y estructura
docs: crear informe académico completo en Documentacion/Informe.md
docs: agregar diagramas UML y MER en Mermaid

# Tareas de mantenimiento
chore: actualizar dependencia @supabase/ssr a v0.10.2
chore: agregar .env.example con variables de entorno sin valores reales
chore: configurar tailwind.config.js con tokens de color del diseño eMeet

# Pruebas
test: agregar casos de prueba manuales para flujo de autenticación
```

---

## 3. Commits Pequeños y Frecuentes

### Principio fundamental

> Un commit debe representar **una unidad lógica de trabajo**, equivalente a "lo que puedo describir en una sola oración".

### Guía práctica

| Situación | Recomendación |
|---|---|
| Terminé un componente nuevo | Hacer commit ahora |
| Corregí un bug específico | Hacer commit ahora |
| Implementé una función o hook | Hacer commit ahora |
| Actualicé un archivo de documentación | Hacer commit ahora |
| Terminé una sesión de trabajo | Hacer commit de lo que está listo, push a la rama personal |
| Terminé completamente una feature | Abrir Pull Request hacia `dev` |

### ¿Qué NO hacer?

```bash
# ❌ Trabajar 3 días sin hacer commit y luego...
git add .
git commit -m "frontend completo"
git push

# ❌ Mezclar múltiples funcionalidades en un commit
git commit -m "auth, chat, admin y perfil terminados"

# ❌ Commitear código con errores de compilación
```

---

## 4. Cómo Asociar Cambios a Integrantes del Equipo

### Configurar la identidad de Git correctamente

Cada integrante debe ejecutar estos comandos en su equipo local **antes de hacer commits**:

```bash
git config --global user.name "Daniel Bravo"
git config --global user.email "tu-correo-de-github@email.com"
```

> El correo debe ser el **mismo que está registrado en la cuenta de GitHub** para que los commits aparezcan asociados al perfil correcto.

### Verificar la configuración actual

```bash
git config user.name
git config user.email
```

### Ver commits por autor en el repositorio

```bash
# Ver commits del autor "Daniel Bravo"
git log --author="Daniel Bravo" --oneline --graph

# Ver cuántos commits hizo cada integrante
git shortlog -sn
```

---

## 5. Cómo Revisar el Historial en GitHub

### En la interfaz web de GitHub:

1. Ir al repositorio: `https://github.com/DanielBravoS88/eMeet_frontend`
2. Hacer clic en **"Commits"** (arriba del listado de archivos, debajo del nombre de la rama).
3. El historial muestra todos los commits con autor, fecha y mensaje.
4. Filtrar por autor: en la URL agregar `?author=DanielBravoS88` para ver solo los commits de ese usuario.

### Gráfico de contribuciones:

- Ir a: **Insights** → **Contributors**
- Muestra líneas agregadas/eliminadas y commits por integrante.

---

## 6. Cómo Evitar Subir Todo en un Solo Commit Final

### Estrategia de trabajo diario

```bash
# Al inicio de la sesión: actualizar la rama
git checkout feature/mi-funcionalidad
git pull origin feature/mi-funcionalidad

# Durante el trabajo: commits frecuentes
git add src/components/NuevoComponente.tsx
git commit -m "feat(ui): agregar componente NuevoComponente con props tipadas"

git add src/context/AuthContext.tsx
git commit -m "feat(auth): agregar loginWithApple al AuthContext"

# Al terminar la sesión: push a la rama
git push origin feature/mi-funcionalidad
```

### Usar `git add -p` para commits más precisos

```bash
# Modo interactivo: seleccionar qué cambios incluir en el commit
git add -p src/components/MiComponente.tsx
# Git mostrará cada cambio y preguntará: Stage this hunk? [y/n/q/a/d/s/?]
# y = sí, n = no, s = dividir en chunks más pequeños
```

---

## 7. Evidencia de Colaboración Esperada para la Entrega

Para demostrar trabajo colaborativo del equipo, el historial debe mostrar:

| Requisito | Cómo verificarlo |
|---|---|
| Al menos 2 integrantes con commits | GitHub → Insights → Contributors |
| Commits de diferentes fechas y horas | Historial de commits por rama |
| Commits en diferentes áreas del código | `git log --stat --oneline` |
| Pull Requests abiertos y mergeados | GitHub → Pull Requests (Open + Closed) |
| Revisiones de código | GitHub → Pull Requests → Commits + Reviews |

---

## 8. Template de Commit para Trabajo Académico

Si el equipo necesita una guía rápida para mensajes de commit:

```
feat(área): descripción breve de qué se implementó
fix(área): qué se corrigió y por qué
docs(área): qué documentación se agregó o actualizó
refactor(área): qué se reorganizó sin cambiar funcionalidad
style(área): qué cambio visual se aplicó
chore(área): qué tarea de mantenimiento se realizó
```

**Áreas frecuentes del proyecto eMeet**:
`auth`, `feed`, `chat`, `search`, `saved`, `profile`, `admin`, `locatario`, `supabase`, `maps`, `types`, `docs`, `ui`, `context`, `hooks`, `middleware`
