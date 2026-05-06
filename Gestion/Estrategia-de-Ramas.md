# Estrategia de Ramas — eMeet Backend

## Ramas principales

| Rama | Propósito |
|------|-----------|
| `main` | Producción. Solo recibe merges aprobados desde `dev`. |
| `dev` | Integración continua. Base para nuevas features. |

## Ramas temporales

| Prefijo | Uso | Ejemplo |
|---------|-----|---------|
| `feature/*` | Nuevas funcionalidades | `feature/chat-websocket` |
| `fix/*` | Correcciones de bugs | `fix/cors-header` |
| `hotfix/*` | Parches urgentes en producción | `hotfix/auth-token-expiry` |

## Flujo de trabajo

1. Crear rama desde `dev`: `git checkout -b feature/nombre dev`
2. Desarrollar y hacer commits incrementales.
3. Abrir Pull Request hacia `dev`.
4. Revisión de al menos un integrante antes de merge.
5. Cuando `dev` está estable, abrir PR de `dev` → `main` para release.

## Convenciones de commits

```
tipo(alcance): descripción breve

Ejemplos:
feat(auth): agregar endpoint de logout
fix(profile): corregir validación de avatar
docs(readme): actualizar instrucciones de setup
```
