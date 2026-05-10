# Plan de aseguramiento de calidad (QA) — eMeet

## Objetivo
Garantizar que el sistema eMeet funcione correctamente, sea seguro y cumpla con los requisitos establecidos antes de su entrega final.

---

## 1. Estrategia de pruebas

### Niveles de prueba
| Nivel | Herramienta | Alcance |
|-------|-------------|---------|
| Pruebas unitarias | Vitest | Funciones individuales, middlewares |
| Pruebas de integración | Vitest + supertest | Endpoints de la API |
| Pruebas de sistema | Manual / Postman | Flujos completos de usuario |
| Pruebas de aceptación | Manual | Validación contra requerimientos |

### Tipos de prueba
- **Pruebas funcionales**: verificar que cada endpoint se comporta según lo especificado.
- **Pruebas de seguridad**: verificar autenticación, autorización y protección de datos.
- **Pruebas de rendimiento**: verificar tiempos de respuesta bajo carga normal.
- **Pruebas de regresión**: ejecutar el conjunto de pruebas ante cada cambio.

---

## 2. Pruebas existentes

### `src/middleware/auth.test.ts`
Pruebas unitarias del middleware de autenticación:
- Verificar que request sin token retorna 401.
- Verificar que token inválido retorna 401.
- Verificar que token válido adjunta `authUser` al request.

### Ejecutar pruebas
```bash
npm test
```

---

## 3. Casos de prueba por módulo

### Autenticación (`/auth`)
| ID | Caso | Entrada | Resultado esperado |
|----|------|---------|-------------------|
| AUTH-01 | Registro exitoso | email + password válidos | 200, retorna sesión |
| AUTH-02 | Registro con email duplicado | email ya existente | 400, error |
| AUTH-03 | Login exitoso | credenciales válidas | 200, retorna token |
| AUTH-04 | Login con credenciales incorrectas | password erróneo | 401, error |
| AUTH-05 | Acceso a ruta protegida sin token | sin header Auth | 401, error |
| AUTH-06 | Acceso a ruta protegida con token válido | Bearer válido | 200 |

### Eventos (`/events`)
| ID | Caso | Entrada | Resultado esperado |
|----|------|---------|-------------------|
| EVT-01 | Listar eventos del locatario | token de locatario | 200, array de eventos |
| EVT-02 | Crear evento | datos válidos + token locatario | 201, evento creado |
| EVT-03 | Crear evento sin permisos | token de usuario normal | 403, error |
| EVT-04 | Dar like a evento | token de usuario + evento id | 200 |
| EVT-05 | Eliminar like | token de usuario + evento id | 200 |

### Chat (`/chat`)
| ID | Caso | Entrada | Resultado esperado |
|----|------|---------|-------------------|
| CHAT-01 | Listar salas disponibles | token válido | 200, array de salas |
| CHAT-02 | Unirse a sala | token + room id | 200 |
| CHAT-03 | Enviar mensaje | token + contenido | 201, mensaje creado |
| CHAT-04 | Obtener mensajes | token + room id | 200, array de mensajes |

### Perfil (`/profile`)
| ID | Caso | Entrada | Resultado esperado |
|----|------|---------|-------------------|
| PROF-01 | Obtener perfil propio | token válido | 200, datos del perfil |
| PROF-02 | Actualizar perfil | token + nuevos datos | 200, perfil actualizado |
| PROF-03 | Subir avatar | token + archivo imagen | 200, URL del avatar |

### Administración (`/admin`)
| ID | Caso | Entrada | Resultado esperado |
|----|------|---------|-------------------|
| ADM-01 | Acceso con rol admin | token de admin | 200 |
| ADM-02 | Acceso con rol usuario | token de usuario | 403 |
| ADM-03 | Listar reportes | token admin | 200, array de reportes |
| ADM-04 | Resolver reporte | token admin + id reporte | 200 |

---

## 4. Pruebas de seguridad

| ID | Verificación | Resultado esperado |
|----|-------------|-------------------|
| SEC-01 | Inyección SQL en campos de búsqueda | Sanitizado, sin error de BD |
| SEC-02 | CORS desde origen no autorizado | 403 / bloqueado |
| SEC-03 | Headers HTTP seguros | Helmet activo, headers presentes |
| SEC-04 | Token expirado | 401 automático |
| SEC-05 | Acceso a recurso de otro usuario | 403 o dato vacío |

---

## 5. Criterios de aceptación

- ✅ Todos los endpoints documentados responden correctamente.
- ✅ La autenticación rechaza tokens inválidos o ausentes.
- ✅ Los roles se aplican correctamente (admin, locatario, usuario).
- ✅ El chat muestra mensajes en tiempo real.
- ✅ Las transacciones se registran correctamente.
- ✅ La aplicación no expone datos sensibles en las respuestas.

---

## 6. Herramientas de prueba
- **Vitest**: pruebas unitarias e integración (ya configurado).
- **Postman / Insomnia**: pruebas manuales de la API.
- **Supabase Dashboard**: verificación de datos en BD.
- **Render Logs**: verificación de errores en producción.
