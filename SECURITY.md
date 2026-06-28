# Política de Seguridad — eMeet (Backend)

## Versiones soportadas

| Versión | Soporte de seguridad |
|---|---|
| `main` (última) | ✅ |
| Ramas antiguas | ❌ |

## Cómo reportar una vulnerabilidad

Si encuentras una vulnerabilidad de seguridad en eMeet, por favor **no la publiques
en un issue público**. En su lugar:

1. Usa la opción **"Report a vulnerability"** en la pestaña **Security** del
   repositorio (GitHub Private Vulnerability Reporting), o
2. Contacta de forma privada al equipo de mantenimiento.

Incluye en tu reporte:
- Descripción de la vulnerabilidad y su impacto.
- Pasos para reproducirla.
- Versión / commit afectado.

Nos comprometemos a acusar recibo en un plazo razonable y a trabajar en una
mitigación según la severidad.

## Prácticas de seguridad del proyecto

Este repositorio aplica análisis automático de seguridad en cada `push` y `pull request`:

- **CodeQL** — análisis estático (SAST) de JavaScript/TypeScript.
- **Semgrep** — reglas de seguridad sobre el código.
- **npm audit** — vulnerabilidades en dependencias (SCA).
- **Gitleaks** — detección de secretos/credenciales filtrados.
- **Dependabot** — actualización continua de dependencias y GitHub Actions.

> Las claves de servicio (Supabase Service Role, credenciales de base de datos,
> tokens de pasarelas de pago) **nunca** deben commitearse. Usa variables de
> entorno (`.env`) excluidas por `.gitignore`. El `SUPABASE_SERVICE_ROLE_KEY`
> debe vivir solo en el backend y nunca exponerse al cliente.
