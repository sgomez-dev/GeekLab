# GeekLab — Backend Python/FastAPI

Backend REST API para el e-commerce de informática **GeekLab**, construido como drop-in replacement del backend original en Node.js/Express. Compatible con el frontend Svelte 5 existente sin modificaciones.

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Framework web | **FastAPI** 0.115+ |
| ORM | **SQLAlchemy 2.x** (sync, `DeclarativeBase` con `Mapped[...]`) |
| Migraciones | **Alembic** |
| Base de datos | **SQLite** (desarrollo) — preparado para PostgreSQL |
| Validación | **Pydantic v2** con constraints estrictos |
| Autenticación | **JWT** (`python-jose[cryptography]`) + **bcrypt** (`passlib[bcrypt]`) |
| Servidor ASGI | **uvicorn** |
| Tests | **pytest** + **httpx** |

## Instalación

### Con pip + venv

```bash
cd back-py
python3 -m venv .venv
source .venv/bin/activate      # Linux/macOS
# .venv\Scripts\activate       # Windows

pip install -e ".[dev]"
```

### Variables de entorno

Copia el archivo de ejemplo y ajusta los valores:

```bash
cp .env.example .env
```

Variables disponibles:

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DATABASE_URL` | URL de conexión a la BD | `sqlite:///./geeklab.db` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `cambia-este-secreto-en-produccion` |
| `JWT_ALGORITHM` | Algoritmo JWT | `HS256` |
| `JWT_EXPIRE_HOURS` | Horas de validez del token | `2` |
| `CORS_ORIGINS` | Orígenes CORS separados por coma | `http://localhost:5173,...` |

## Migraciones y seed

```bash
# Aplicar migraciones
alembic upgrade head

# Cargar datos iniciales (admin + productos demo)
python -m app.db.seed
```

Credenciales del admin por defecto: `admin@geeklab.local` / `Admin123!`

## Arrancar el servidor

```bash
uvicorn app.main:app --reload --port 8000
```

El servidor arranca en `http://localhost:8000`. Documentación interactiva disponible en:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Tests

```bash
python -m pytest tests/ -v
```

Los tests usan una base de datos SQLite en memoria — no afectan a la BD de desarrollo.

## Endpoints utilizados por el frontend

### Autenticación (público)

| Método | URL | Rol mínimo | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Registro de nuevo usuario |
| POST | `/api/auth/login` | Público | Login, devuelve JWT + datos del usuario |
| PUT | `/api/auth/password` | Autenticado | Cambio de contraseña |

### Productos

| Método | URL | Rol mínimo | Descripción |
|---|---|---|---|
| GET | `/api/products` | Público | Listar todos los productos |
| GET | `/api/products/:id` | Público | Detalle de un producto |
| POST | `/api/products` | Admin | Crear producto (multipart con imagen) |
| PUT | `/api/products/:id` | Admin | Actualizar producto |
| DELETE | `/api/products/:id` | Admin | Eliminar producto |
| POST | `/api/products/:id/reviews` | Autenticado | Añadir reseña a un producto |

### Usuarios (administración)

| Método | URL | Rol mínimo | Descripción |
|---|---|---|---|
| GET | `/api/users` | Admin | Listar todos los usuarios |
| POST | `/api/users` | Admin | Crear usuario |
| GET | `/api/users/:id` | Admin | Obtener usuario por ID |
| PUT | `/api/users/:id` | Admin | Actualizar usuario |
| PUT | `/api/users/:id/role` | Admin | Cambiar rol de usuario |
| DELETE | `/api/users/:id` | Admin | Eliminar usuario |

### Pedidos / Checkout

| Método | URL | Rol mínimo | Descripción |
|---|---|---|---|
| POST | `/api/checkout` | Autenticado | Crear pedido (valida stock, descuenta atómicamente) |
| GET | `/api/orders` | Admin | Listar todos los pedidos |
| GET | `/api/orders/my` | Autenticado | Listar pedidos propios |
| PUT | `/api/orders/:id/status` | Admin | Cambiar estado del pedido |

### Foro

| Método | URL | Rol mínimo | Descripción |
|---|---|---|---|
| GET | `/api/forum/messages` | Público | Listar mensajes recientes (últimos 100) |
| POST | `/api/forum/messages` | Autenticado | Publicar mensaje en el foro |

## Conectar el frontend existente

En el archivo `front/src/services/api.ts`, la variable `BACKEND_URL` se configura con `VITE_BACKEND_URL`. Cambiarlo a:

```
VITE_BACKEND_URL=http://localhost:8000
```

O directamente en `front/src/services/api.ts`, asegurarse de que `BACKEND_URL` apunte a `http://localhost:8000`. El `baseURL` de axios quedará como `http://localhost:8000/api`.

El frontend Svelte 5 funciona sin modificaciones con este backend.

## Verificación manual

Se arrancó el servidor con `uvicorn app.main:app --port 8000` y se realizaron las siguientes pruebas contra la API:

### Login (`POST /api/auth/login`)

```bash
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@geeklab.local","password":"Admin123!"}'
```

**Resultado:** 200 OK — Devuelve `{ token, username: "admin", role: "admin" }`. El token JWT se genera correctamente con payload `{id, role, username}` y expiración de 2 horas.

### Listar productos (`GET /api/products`)

```bash
curl -s http://localhost:8000/api/products
```

**Resultado:** 200 OK — Devuelve array de 10 productos del seed, cada uno con `_id`, `name`, `brand`, `price`, `description`, `category`, `stock`, `image`, `reviews`, `averageRating`, `numReviews`. El campo `_id` se serializa como string (compatible con el frontend que espera estilo MongoDB).

### Listar usuarios como admin (`GET /api/users`)

```bash
curl -s http://localhost:8000/api/users -H "Authorization: Bearer <token>"
```

**Resultado:** 200 OK — Devuelve array con 1 usuario (el admin del seed). Campos: `_id`, `username`, `email`, `role`, `createdAt`, `updatedAt`.

### Checkout (`POST /api/checkout`)

```bash
curl -s -X POST http://localhost:8000/api/checkout \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"_id":1,"quantity":2}]}'
```

**Resultado:** 200 OK — Devuelve `{ message: "Compra realizada con éxito", order: { _id, userId: { username, email }, items, total: 3199.98, status: "pending", createdAt, updatedAt } }`. El stock del producto se decrementó de 15 a 13.

### Listar pedidos como admin (`GET /api/orders`)

```bash
curl -s http://localhost:8000/api/orders -H "Authorization: Bearer <token>"
```

**Resultado:** 200 OK — Devuelve array con 1 orden creada en el paso anterior.

### Foro (`GET /api/forum/messages`)

```bash
curl -s http://localhost:8000/api/forum/messages
```

**Resultado:** 200 OK — Devuelve array vacío (no hay mensajes todavía). El endpoint es público.

### Tests automatizados

```bash
python -m pytest tests/ -v
```

**Resultado:** 35/35 tests pasan. Cobertura:

| Módulo | Tests | Qué cubre |
|---|---|---|
| `test_auth.py` | 9 | Login OK/fallido, registro, registro duplicado, cambio contraseña, acceso sin token (401), token inválido (401), user en ruta admin (403) |
| `test_products.py` | 9 | CRUD completo, stock negativo (400), reseña con recálculo de rating |
| `test_orders.py` | 8 | Checkout exitoso, stock insuficiente (400), items vacíos (422), sin auth (401), admin lista/actualiza, verificación de decremento de stock |
| `test_users.py` | 9 | Admin CRUD, user prohibido (403), admin no puede cambiar su propio rol (403), admin no puede borrarse (403), borrar inexistente (404) |

### Resumen de verificación

| Funcionalidad | Estado |
|---|---|
| Login/Register/Cambio contraseña | Funciona |
| CRUD de productos (con multipart/imagen) | Funciona |
| Reseñas de productos | Funciona |
| Gestión de usuarios (admin) | Funciona |
| Checkout con validación de stock | Funciona |
| Decremento atómico de stock | Funciona |
| Listado y actualización de pedidos | Funciona |
| Foro (GET/POST mensajes) | Funciona |
| Validación Pydantic (422 en datos inválidos) | Funciona |
| Manejo global de excepciones (401/403/404/409/400/500) | Funciona |
| Serialización `_id` estilo MongoDB | Funciona |
| Documentación OpenAPI auto-generada (`/docs`) | Funciona |

## Decisiones de arquitectura

### Por qué FastAPI sobre Flask
FastAPI ofrece validación automática con Pydantic v2, documentación OpenAPI generada automáticamente, inyección de dependencias nativa (ideal para auth y DB session), y tipado estricto que reduce errores en tiempo de desarrollo.

### Por qué SQLAlchemy puro y no SQLModel
SQLModel mezcla la capa de modelo de datos (ORM) con la capa de validación (Pydantic), violando la separación de responsabilidades que exige la arquitectura en capas. Con SQLAlchemy puro, los modelos ORM viven en `models/` y los schemas Pydantic en `schemas/`, sin acoplamiento.

### Por qué SQLite
Para desarrollo local, SQLite es la opción más simple: no requiere instalar un servidor de BD, se almacena en un único archivo, y con Alembic configurado, migrar a PostgreSQL solo requiere cambiar `DATABASE_URL`.

### Por qué patrón repositorio explícito
El patrón repositorio encapsula todo el acceso a datos, permitiendo que los services no importen SQLAlchemy directamente. Esto facilita testear la lógica de negocio de forma aislada y cambiar la implementación de persistencia sin tocar la capa de servicio.

### Sobre Socket.IO y GraphQL
Socket.IO y GraphQL del backend original no son requisito de esta práctica; el frontend funcionará con polling/REST como fallback. El foro expone endpoints REST (`GET/POST /api/forum/messages`). El modo tiempo real queda para una iteración futura.

## Memoria de uso de IA

El desarrollo de este backend se realizó con asistencia de **Claude Code** (Anthropic). El documento [AI_USAGE.md](AI_USAGE.md) contiene la memoria completa del proceso: prompts utilizados, iteraciones realizadas, y un análisis crítico de errores y alucinaciones detectados durante el desarrollo.
