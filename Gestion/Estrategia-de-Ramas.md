# Estrategia de Ramas — eMeet Backend

## Ramas principales

| Rama   | Propósito                                                      |
|--------|----------------------------------------------------------------|
| `main` | Rama de producción. Contiene código estable y desplegado.      |
| `dev`  | Rama de desarrollo. Integración de nuevas funcionalidades.     |

## Ramas de apoyo

| Prefijo      | Descripción                                           |
|--------------|-------------------------------------------------------|
| `feature/*`  | Nuevas funcionalidades (ej. `feature/monetizacion`).  |
| `fix/*`      | Correcciones de errores específicos.                  |
| `hotfix/*`   | Correcciones urgentes directamente en producción.     |

## Flujo de trabajo

```
feature/xxx  ──┐
fix/xxx      ──┤──► dev ──► main (producción / Render)
hotfix/xxx   ──┘
```

1. Cada integrante trabaja en su rama de funcionalidad o corrección.
2. Se realiza un **Pull Request** hacia `dev` para revisión.
3. Una vez validado en `dev`, se fusiona a `main` para despliegue en Render.

## Convenciones de nomenclatura

- Usar guiones (`-`) para separar palabras: `feature/chat-realtime`.
- Nombres en español o inglés, siempre en minúsculas.
- Evitar nombres genéricos como `dev2`, `nueva-rama` o `cambios`.

## Repositorio complementario

El proyecto frontend mantiene una estrategia de ramas equivalente:  
https://github.com/DanielBravoS88/eMeet_frontend
