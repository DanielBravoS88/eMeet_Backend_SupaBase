# Estrategia de ramas

## Rama de producción
- `main`: contiene la versión estable del proyecto, lista para producción y despliegue.

## Rama de desarrollo
- `dev`: integración de funcionalidades antes de fusionarse a `main`.

## Rama de apoyo
- `estructura-de-documentación`: desarrollo de documentación.
  

## Flujo de trabajo
1. Cada integrante trabaja en su propia rama de funcionalidad (`feature/nombre-tarea`).
2. Al completar la funcionalidad se abre un Pull Request hacia `dev`.
3. El equipo revisa y aprueba el PR.
4. Cuando `dev` alcanza un estado estable, se fusiona a `main` para producción.

## Convención de nombres
| Tipo                | Prefijo    | Ejemplo                       |
|---------------------|------------|-------------------------------|
| Funcionalidad nueva | `feature/` | `feature/chat-realtime`       |
| Corrección de error | `fix/`     | `fix/auth-token-expiry`       |
| Documentación       | `docs/`    | `docs/api-endpoints`          |

## Observación
El proyecto está dividido en dos repositorios. Cada uno usa su propia convención de nombre para la rama de desarrollo:
- **Frontend** (`eMeet_frontend`): producción en `main`, desarrollo en `develop`.
- **Backend** (`eMeet_Backend_SupaBase`): producción en `main`, desarrollo en `dev`.

Para proyectos futuros se recomienda unificar el nombre de la rama de desarrollo (`develop` o `dev`) en todos los repositorios del mismo proyecto.
