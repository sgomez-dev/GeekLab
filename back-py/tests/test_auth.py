def test_register_success(client):
    resp = client.post("/api/auth/register", json={
        "username": "newuser",
        "email": "new@test.com",
        "password": "Pass1234!",
    })
    assert resp.status_code == 201
    assert resp.json()["message"] == "User registered successfully"


def test_register_duplicate_email(client):
    client.post("/api/auth/register", json={
        "username": "user1",
        "email": "dup@test.com",
        "password": "Pass1234!",
    })
    resp = client.post("/api/auth/register", json={
        "username": "user2",
        "email": "dup@test.com",
        "password": "Pass1234!",
    })
    assert resp.status_code == 409


def test_login_success(client, admin_user):
    resp = client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "Admin123!",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "token" in data
    assert data["username"] == "admin"
    assert data["role"] == "admin"


def test_login_wrong_password(client, admin_user):
    resp = client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "wrong",
    })
    assert resp.status_code == 401


def test_login_nonexistent_email(client):
    resp = client.post("/api/auth/login", json={
        "email": "nobody@test.com",
        "password": "anything",
    })
    assert resp.status_code == 401


def test_access_without_token(client):
    resp = client.get("/api/users")
    assert resp.status_code == 401


def test_access_with_invalid_token(client):
    resp = client.get("/api/users", headers={"Authorization": "Bearer invalidtoken"})
    assert resp.status_code == 401


def test_user_cannot_access_admin_route(client, user_header):
    resp = client.get("/api/users", headers=user_header)
    assert resp.status_code == 403


def test_change_password(client, admin_user, auth_header):
    resp = client.put("/api/auth/password", json={"password": "NewPass123!"}, headers=auth_header)
    assert resp.status_code == 200

    # Login con nueva contraseña
    resp = client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "NewPass123!",
    })
    assert resp.status_code == 200
