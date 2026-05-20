def test_list_products_public(client, sample_product):
    resp = client.get("/api/products")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["_id"] == str(sample_product.id)
    assert data[0]["name"] == "RTX 4090"


def test_get_product(client, sample_product):
    resp = client.get(f"/api/products/{sample_product.id}")
    assert resp.status_code == 200
    assert resp.json()["_id"] == str(sample_product.id)


def test_get_product_not_found(client):
    resp = client.get("/api/products/999")
    assert resp.status_code == 404


def test_create_product_admin(client, auth_header):
    resp = client.post("/api/products", data={
        "name": "Test GPU",
        "price": "299.99",
        "stock": "5",
        "brand": "TestBrand",
        "category": "GPUs",
        "description": "A test GPU",
    }, headers=auth_header)
    assert resp.status_code == 201
    assert resp.json()["name"] == "Test GPU"


def test_create_product_user_forbidden(client, user_header):
    resp = client.post("/api/products", data={
        "name": "Test",
        "price": "100",
    }, headers=user_header)
    assert resp.status_code == 403


def test_update_product(client, sample_product, auth_header):
    resp = client.put(f"/api/products/{sample_product.id}", data={
        "name": "RTX 4090 Ti",
        "price": "1799.99",
    }, headers=auth_header)
    assert resp.status_code == 200
    assert resp.json()["name"] == "RTX 4090 Ti"


def test_delete_product(client, sample_product, auth_header):
    resp = client.delete(f"/api/products/{sample_product.id}", headers=auth_header)
    assert resp.status_code == 200
    # Verificar que ya no existe
    resp = client.get(f"/api/products/{sample_product.id}")
    assert resp.status_code == 404


def test_create_product_negative_stock(client, auth_header):
    resp = client.post("/api/products", data={
        "name": "Bad Product",
        "price": "100",
        "stock": "-5",
    }, headers=auth_header)
    assert resp.status_code == 400


def test_add_review(client, sample_product, user_header):
    resp = client.post(f"/api/products/{sample_product.id}/reviews", json={
        "rating": 5,
        "comment": "Excelente producto",
    }, headers=user_header)
    assert resp.status_code == 201
    data = resp.json()
    assert data["numReviews"] == 1
    assert data["averageRating"] == 5.0
    assert len(data["reviews"]) == 1
