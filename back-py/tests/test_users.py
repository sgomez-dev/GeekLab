def test_list_users_admin(client, admin_user, auth_header):
    resp = client.get("/api/users", headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["_id"] == admin_user.id


def test_list_users_forbidden_for_normal_user(client, user_header):
    resp = client.get("/api/users", headers=user_header)
    assert resp.status_code == 403


def test_create_user_admin(client, auth_header):
    resp = client.post("/api/users", json={
        "username": "newadmin",
        "email": "newadmin@test.com",
        "password": "Pass1234!",
        "role": "admin",
    }, headers=auth_header)
    assert resp.status_code == 201
    data = resp.json()
    assert data["user"]["username"] == "newadmin"
    assert data["user"]["role"] == "admin"


def test_create_user_forbidden_for_normal_user(client, user_header):
    resp = client.post("/api/users", json={
        "username": "nope",
        "email": "nope@test.com",
        "password": "Pass1234!",
    }, headers=user_header)
    assert resp.status_code == 403


def test_update_user_role(client, normal_user, auth_header):
    resp = client.put(f"/api/users/{normal_user.id}/role", json={
        "role": "admin",
    }, headers=auth_header)
    assert resp.status_code == 200
    assert resp.json()["user"]["role"] == "admin"


def test_admin_cannot_change_own_role(client, admin_user, auth_header):
    resp = client.put(f"/api/users/{admin_user.id}/role", json={
        "role": "user",
    }, headers=auth_header)
    assert resp.status_code == 403


def test_delete_user(client, normal_user, auth_header):
    resp = client.delete(f"/api/users/{normal_user.id}", headers=auth_header)
    assert resp.status_code == 200
    assert resp.json()["message"] == "User deleted successfully"


def test_admin_cannot_delete_self(client, admin_user, auth_header):
    resp = client.delete(f"/api/users/{admin_user.id}", headers=auth_header)
    assert resp.status_code == 403


def test_delete_nonexistent_user(client, auth_header):
    resp = client.delete("/api/users/9999", headers=auth_header)
    assert resp.status_code == 404
