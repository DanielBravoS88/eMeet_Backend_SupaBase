# DAST del backend

Esta primera fase integra OWASP ZAP en modo seguro (`-S`) contra una superficie
OpenAPI reducida y no destructiva. El script solo admite hosts locales en el
puerto 4000.

`openapi-safe.yaml` incluye:

- `GET /health`;
- `GET /auth/session` sin token;
- el catalogo estatico `GET /monetization/packs`;
- comprobaciones anonimas de endpoints protegidos que deben responder `401`.

Se excluyen registro, login, recuperacion de clave, escrituras, borrados,
eventos publicos respaldados por base de datos, pagos, QR, Google Places y
webhooks.

## Inicio local aislado

El backend exige variables Supabase al cargar sus modulos. Para esta fase se
usan valores ficticios locales y se desactiva el proceso de limpieza. Ninguna
ruta incluida necesita conectarse a Supabase.

```powershell
$env:PORT='4000'
$env:SUPABASE_URL='http://127.0.0.1:54321'
$env:SUPABASE_ANON_KEY='dast-local-anon-key'
$env:SUPABASE_SERVICE_ROLE_KEY='dast-local-service-role-key'
$env:FRONTEND_ORIGIN='http://127.0.0.1:3000'
$env:BACKEND_PUBLIC_URL='http://127.0.0.1:4000'
$env:CLEANUP_ENABLED='false'
.\node_modules\.bin\tsx.cmd src/server.ts
```

En otra terminal, y solo despues de aprobar la descarga/ejecucion de ZAP:

```powershell
./dast/run-api-baseline.ps1
```

Los reportes quedan en `dast/reports/` y no se versionan.
