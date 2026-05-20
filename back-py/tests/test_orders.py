def test_checkout_success(client, sample_product, user_header):
    resp = client.post("/api/checkout", json={
        "items": [{"_id": sample_product.id, "quantity": 2}],
    }, headers=user_header)
    assert resp.status_code == 200
    data = resp.json()
    assert data["message"] == "Compra realizada con éxito"
    assert data["order"]["status"] == "pending"
    assert data["order"]["total"] == round(sample_product.price * 2, 2)


def test_checkout_insufficient_stock(client, sample_product, user_header):
    resp = client.post("/api/checkout", json={
        "items": [{"_id": sample_product.id, "quantity": 999}],
    }, headers=user_header)
    assert resp.status_code == 400
    data = resp.json()
    assert data["message"] == "Stock insuficiente"
    assert "details" in data


def test_checkout_empty_items(client, user_header):
    resp = client.post("/api/checkout", json={"items": []}, headers=user_header)
    assert resp.status_code == 422


def test_checkout_without_auth(client, sample_product):
    resp = client.post("/api/checkout", json={
        "items": [{"_id": sample_product.id, "quantity": 1}],
    })
    assert resp.status_code == 401


def test_list_orders_admin(client, sample_product, user_header, auth_header):
    # Crear una orden primero
    client.post("/api/checkout", json={
        "items": [{"_id": sample_product.id, "quantity": 1}],
    }, headers=user_header)

    resp = client.get("/api/orders", headers=auth_header)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_list_orders_user_forbidden(client, user_header):
    resp = client.get("/api/orders", headers=user_header)
    assert resp.status_code == 403


def test_update_order_status(client, sample_product, user_header, auth_header):
    # Crear orden
    checkout = client.post("/api/checkout", json={
        "items": [{"_id": sample_product.id, "quantity": 1}],
    }, headers=user_header)
    order_id = checkout.json()["order"]["_id"]

    resp = client.put(f"/api/orders/{order_id}/status", json={
        "status": "completed",
    }, headers=auth_header)
    assert resp.status_code == 200


def test_stock_decremented_after_checkout(client, sample_product, user_header):
    original_stock = sample_product.stock
    qty = 3
    client.post("/api/checkout", json={
        "items": [{"_id": sample_product.id, "quantity": qty}],
    }, headers=user_header)

    resp = client.get(f"/api/products/{sample_product.id}")
    assert resp.json()["stock"] == original_stock - qty
