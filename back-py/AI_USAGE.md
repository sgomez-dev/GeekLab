# Memoria de uso de IA — Backend GeekLab en Python

## Herramientas usadas
- **Claude Code** (Anthropic, modelo Claude Opus 4.6) — asistente principal para todo el desarrollo

## Prompts clave e iteraciones

### 1. Configuración de JWT con FastAPI
**Prompt inicial:** "Configura autenticación JWT usando python-jose y passlib para hashing de contraseñas con bcrypt, compatible con el frontend Svelte que envía Authorization: Bearer <token>."

**Resultado:** El código generado usó `python-jose[cryptography]` con `HS256` y `passlib[bcrypt]` para hashing. Creó funciones `hash_password`, `verify_password`, `create_access_token` y `decode_access_token` en `core/security.py`. La dependency `get_current_user` extrae el token del header Authorization.

**Problema:** Al ejecutar por primera vez, `passlib` lanzó un error `AttributeError: module 'bcrypt' has no attribute '__about__'` — incompatibilidad entre passlib 1.7.4 y bcrypt 5.x (ver Error 1 abajo).

**Refinamiento:** Fijamos la versión de bcrypt a `>=4.0.0,<4.1.0` en `pyproject.toml`.

**Resultado final:** JWT funcional con tokens de 2h de duración, payload `{id, role, username}`, compatible con el frontend.

### 2. Estructura en capas y patrón repositorio
**Prompt inicial:** "Implementa una arquitectura estricta en capas: routers → services → repositories. Los services no deben importar SQLAlchemy, los repos no deben importar FastAPI."

**Resultado:** Se generó la estructura completa con separación clara. Los repositories reciben `Session` y exponen métodos de dominio (`find_by_email`, `decrement_stock_atomic`). Los services reciben repositories y devuelven dicts puros.

**Problema:** La primera iteración del `ReviewService` accedía directamente a `self.product_repo.db.expire(product)`, violando la regla de que los services no tocan SQLAlchemy.

**Refinamiento:** Se añadió un método `refresh()` al `ProductRepository` que encapsula el `expire` + `refresh` de SQLAlchemy, manteniendo la separación de capas.

**Resultado final:** Capas limpias — los services solo llaman métodos de repositorios, nunca operaciones ORM directas.

### 3. Transacción atómica de checkout
**Prompt inicial:** "Implementa el checkout con validación de stock atómica: bloquear filas con FOR UPDATE, verificar stock, decrementar y crear orden en la misma transacción."

**Resultado:** Se implementó `find_by_id_for_update` en el repository usando `select().with_for_update()`, y el `OrderService.checkout()` valida stock, decrementa y crea la orden dentro de una transacción (el commit lo maneja el middleware de sesión en `get_db`).

**Problema:** `with_for_update()` no tiene efecto real en SQLite (no soporta SELECT FOR UPDATE). La transacción es atómica igualmente porque SQLite serializa escrituras, pero en PostgreSQL sí sería necesario.

**Refinamiento:** Se documentó esta limitación. El código está preparado para Postgres sin cambios — solo cambiar `DATABASE_URL`.

**Resultado final:** Checkout transaccional correcto; 35/35 tests pasan incluyendo test de stock insuficiente.

### 4. Configuración de tests con SQLite en memoria
**Prompt inicial:** "Configura pytest con fixtures para DB de test en memoria, client de FastAPI, y tokens de autenticación."

**Resultado:** Primer intento usó `create_engine("sqlite:///:memory:")` con un sessionmaker compartido entre fixtures y el override de `get_db`.

**Problema:** Error "no such table: users" — SQLite en memoria crea una BD nueva por cada conexión. El `TestClient` (que usa threads) obtenía una conexión diferente sin las tablas.

**Refinamiento:** Se usó `StaticPool` de SQLAlchemy junto con `check_same_thread=False` para que todas las conexiones compartan el mismo pool estático con la misma BD en memoria.

**Resultado final:** Todos los tests ejecutan contra la misma BD en memoria, correctamente aislados por fixture.

### 5. Serialización de IDs (_id) para compatibilidad con frontend Mongo-style
**Prompt inicial:** "El frontend espera campos _id en todas las respuestas (estilo MongoDB). Necesito que los IDs enteros de SQLite se serialicen como _id."

**Resultado:** Se serializaron manualmente en los services: `{"_id": str(product.id), ...}`. Para el schema de checkout, se usó `Field(alias="_id")` con `populate_by_name=True` para recibir `_id` del frontend.

**Problema inicial (descartado):** Se consideró usar `model_serializer` en Pydantic para hacer la conversión automática, pero al final los services devuelven dicts directamente (no modelos Pydantic), así que la serialización manual fue más simple y explícita.

**Resultado final:** El frontend recibe `_id` en todos los objetos, compatible con el contrato original sin tocar el código Svelte.

### 6. Validación de Form data vs JSON body
**Prompt inicial:** "Implementa validación Pydantic estricta para todos los endpoints de creación y edición."

**Resultado:** Se crearon schemas para endpoints JSON (auth, checkout, reviews). Para productos, el endpoint usa `Form()` + `File()` (multipart) en lugar de JSON.

**Problema:** Los parámetros `Form()` de FastAPI no pasan por un schema Pydantic completo — llegan como strings y se convierten al tipo declarado, pero constraints como `ge=0` para stock no se evalúan. Un stock de `-5` pasaba la validación y creaba el producto.

**Refinamiento:** Se añadió validación explícita en el router de productos para stock y precio antes de llamar al service.

**Resultado final:** Stock negativo devuelve 400 correctamente. Los endpoints JSON sí usan schemas Pydantic completos con todas las constraints.

## Análisis crítico de errores/alucinaciones

### Error 1: Incompatibilidad passlib con bcrypt 5.x
**Contexto:** Al configurar el hashing de contraseñas con passlib[bcrypt].

**Lo que la IA generó:**
```python
# pyproject.toml
"passlib[bcrypt]>=1.7.4",
# Sin fijar versión de bcrypt
```

**Por qué es incorrecto:**
- `passlib` 1.7.4 no es compatible con `bcrypt` >= 4.1.0 porque intenta acceder a `bcrypt.__about__.__version__`, un atributo que se eliminó en versiones recientes de bcrypt.
- El error no es evidente hasta que se ejecuta: `AttributeError: module 'bcrypt' has no attribute '__about__'`, seguido de `ValueError: password cannot be longer than 72 bytes`.
- Este es un problema conocido de la librería passlib, que lleva años sin mantenimiento activo (última release en 2022).

**Corrección aplicada:**
```python
# pyproject.toml
"passlib[bcrypt]>=1.7.4",
"bcrypt>=4.0.0,<4.1.0",  # Fijar versión compatible con passlib
```

**Lección:** Las dependencias transitivas pueden causar incompatibilidades silenciosas. Siempre verificar que las versiones de librerías que interactúan entre sí sean compatibles, especialmente con proyectos sin mantenimiento activo como passlib.

### Error 2: SQLite en memoria no comparte estado entre conexiones
**Contexto:** Configurando fixtures de pytest para tests con DB en memoria.

**Lo que la IA generó:**
```python
@pytest.fixture()
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

@pytest.fixture()
def client(db_session):
    def _override_get_db():
        yield db_session  # Mismo session para todos
    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
```

**Por qué es incorrecto:**
- SQLite `:memory:` crea una base de datos **por conexión**, no por engine. El `TestClient` de Starlette ejecuta endpoints en un thread diferente.
- Sin `StaticPool`, el engine crea conexiones nuevas que apuntan a DBs vacías.
- Sin `check_same_thread=False`, SQLite lanza `ProgrammingError: SQLite objects created in a thread can only be used in that same thread`.
- El override de `get_db` reutilizaba el mismo session sin hacer commit, causando que los datos insertados en fixtures no fueran visibles en las requests HTTP.

**Corrección aplicada:**
```python
@pytest.fixture()
def db_engine():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,  # Todas las conexiones comparten la misma
    )
    Base.metadata.create_all(bind=engine)
    yield engine

@pytest.fixture()
def client(Session):
    def _override_get_db():
        db = Session()
        try:
            yield db
            db.commit()   # Commit explícito
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()
    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
```

**Lección:** SQLite en memoria tiene semánticas diferentes a SQLite en archivo y a Postgres. Para tests con FastAPI/Starlette, `StaticPool` es esencial para compartir la BD entre threads, y cada request necesita su propio session con commit/rollback explícito.

### Error 3: Violación de capas — service accediendo directamente al ORM
**Contexto:** Después de añadir una review, el `ReviewService` necesitaba refrescar el producto para que las reviews recién añadidas aparecieran en la respuesta.

**Lo que la IA generó:**
```python
# Dentro de ReviewService
self.product_repo.db.expire(product)  # Acceso directo a la sesión SQLAlchemy
```

**Por qué es incorrecto:**
- La regla de capas dice: "Los services NO importan nada de SQLAlchemy directamente". Acceder a `repo.db` (que es un `Session` de SQLAlchemy) rompe esta encapsulación.
- Si mañana cambiamos el ORM o la implementación del repository, el service se rompería.

**Corrección aplicada:**
```python
# En ProductRepository — nuevo método de dominio
def refresh(self, product: Product) -> Product:
    self.db.expire(product)
    self.db.refresh(product)
    return product

# En ReviewService — usa el método del repo
self.product_repo.refresh(product)
```

**Lección:** Cada vez que un service necesita una operación de persistencia, debe existir un método explícito en el repository, por trivial que sea. Esto mantiene la separación limpia y hace que los cambios de implementación de BD no se propaguen a la capa de negocio.
