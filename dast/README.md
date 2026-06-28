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

El script usa Docker cuando esta disponible. En Windows tambien admite ZAP
portable mediante `ZAP_HOME`; si la variable no existe busca por defecto en
`C:\tmp\ZAP_2.17.0`. El plan nativo importa exclusivamente
`openapi-safe.yaml` y no contiene un trabajo de active scan.

Los reportes quedan en `dast/reports/` y no se versionan.

El resultado local verificado se documenta en
[`BASELINE_RESULTS.md`](./BASELINE_RESULTS.md).

## Fase autenticada efimera

El workflow `.github/workflows/security-dast-authenticated.yml` crea un runner
desechable con Supabase local, aplica copias temporales de los SQL existentes y
genera cuentas ficticias `user`, `creator` y `admin`. Primero valida una matriz
explicita de respuestas `200/401/403`; despues ejecuta ZAP pasivo con un token
Bearer distinto por rol sobre `openapi-authenticated-safe.yaml`.

Esta fase no modifica el runtime, no versiona claves o contrasenas, no ejecuta
metodos de escritura y no contacta Supabase, Render ni pagos de produccion. El
trigger `push` de `prueba-dats` es temporal para validar el workflow antes de
dejarlo exclusivamente manual.
