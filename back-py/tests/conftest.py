import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import User, Product


@pytest.fixture()
def db_engine():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, _connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def Session(db_engine):
    return sessionmaker(bind=db_engine, autoflush=False, expire_on_commit=False)


@pytest.fixture()
def db_session(Session):
    session = Session()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(Session):
    def _override_get_db():
        db = Session()
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def admin_user(db_session):
    user = User(
        username="admin",
        email="admin@test.com",
        password=hash_password("Admin123!"),
        role="admin",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def normal_user(db_session):
    user = User(
        username="testuser",
        email="user@test.com",
        password=hash_password("User1234!"),
        role="user",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def admin_token(admin_user):
    return create_access_token({"id": admin_user.id, "role": "admin", "username": admin_user.username})


@pytest.fixture()
def user_token(normal_user):
    return create_access_token({"id": normal_user.id, "role": "user", "username": normal_user.username})


@pytest.fixture()
def sample_product(db_session):
    product = Product(
        name="RTX 4090",
        brand="NVIDIA",
        price=1599.99,
        description="GPU tope de gama",
        category="Tarjetas Gráficas",
        stock=10,
        image="",
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


@pytest.fixture()
def auth_header(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture()
def user_header(user_token):
    return {"Authorization": f"Bearer {user_token}"}
