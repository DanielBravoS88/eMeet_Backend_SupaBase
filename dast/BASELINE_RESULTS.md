# Resultado baseline DAST del backend

Fecha: 2026-06-27  
Herramienta: OWASP ZAP 2.17.0 portable  
Objetivo: `http://127.0.0.1:4000`  
Modo: importacion OpenAPI segura + escaneo pasivo, sin active scan

## Controles de alcance

- backend enlazado exclusivamente a `127.0.0.1`;
- variables Supabase ficticias apuntando a loopback;
- `CLEANUP_ENABLED=false`;
- OpenAPI reducido a 11 operaciones GET no destructivas;
- sin registro, login, correo, escritura, borrado, pagos, webhooks ni proxies;
- ninguna conexion a base de datos o servicio externo fue necesaria.

## Resultado

- `GET /health`, `GET /auth/session` y `GET /monetization/packs`: `200`;
- ocho endpoints protegidos sin token: `401`;
- tipos de alerta ZAP: 0;
- plan de automatizacion completado correctamente.

Este resultado valida exposicion anonima basica y headers de la superficie
segura. No valida autorizacion horizontal/vertical, JWT, roles, RLS ni flujos
con datos. Esos controles requieren cuentas y una base DAST aislada.

Los reportes HTML/JSON/Markdown se mantienen como artifacts locales o de CI;
`dast/reports/` esta excluido de Git.
