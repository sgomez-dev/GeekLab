"""
Seed script — crea un admin por defecto y productos demo.
Ejecutar: python -m app.db.seed
"""

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models import ForumMessage, Order, Product, Review, User  # noqa: F401


PRODUCTS = [
    {
        "name": "NVIDIA GeForce RTX 4090",
        "brand": "NVIDIA",
        "price": 1599.99,
        "description": "Tarjeta gráfica tope de gama con 24 GB GDDR6X y arquitectura Ada Lovelace.",
        "category": "Tarjetas Gráficas",
        "stock": 15,
        "image": "",
    },
    {
        "name": "AMD Ryzen 9 7950X",
        "brand": "AMD",
        "price": 549.99,
        "description": "Procesador de 16 núcleos y 32 hilos con arquitectura Zen 4, ideal para productividad y gaming.",
        "category": "Procesadores",
        "stock": 25,
        "image": "",
    },
    {
        "name": "Corsair Vengeance DDR5 32GB (2x16GB)",
        "brand": "Corsair",
        "price": 124.99,
        "description": "Kit de memoria DDR5 a 5600 MHz con perfiles XMP 3.0 para overclocking sencillo.",
        "category": "Memorias RAM",
        "stock": 40,
        "image": "",
    },
    {
        "name": "Samsung 990 Pro 2TB NVMe SSD",
        "brand": "Samsung",
        "price": 179.99,
        "description": "SSD NVMe Gen4 con velocidades de lectura de hasta 7450 MB/s.",
        "category": "Almacenamiento",
        "stock": 50,
        "image": "",
    },
    {
        "name": "ASUS ROG Strix B650E-F Gaming WiFi",
        "brand": "ASUS",
        "price": 289.99,
        "description": "Placa base ATX con socket AM5, WiFi 6E, PCIe 5.0 y USB 4.",
        "category": "Placas Base",
        "stock": 20,
        "image": "",
    },
    {
        "name": "Corsair RM850x 850W 80+ Gold",
        "brand": "Corsair",
        "price": 129.99,
        "description": "Fuente de alimentación modular 80 Plus Gold con ventilador de 0 RPM a baja carga.",
        "category": "Fuentes de Alimentación",
        "stock": 30,
        "image": "",
    },
    {
        "name": "Logitech G Pro X Superlight 2",
        "brand": "Logitech",
        "price": 159.99,
        "description": "Ratón gaming inalámbrico ultraligero (60g) con sensor HERO 2 de 32K DPI.",
        "category": "Periféricos",
        "stock": 35,
        "image": "",
    },
    {
        "name": "LG 27GP850-B UltraGear 27\" QHD 165Hz",
        "brand": "LG",
        "price": 349.99,
        "description": "Monitor gaming Nano IPS de 27 pulgadas, 1ms de respuesta, HDR400 y compatible con G-Sync.",
        "category": "Monitores",
        "stock": 12,
        "image": "",
    },
    {
        "name": "NZXT H7 Flow Mid-Tower",
        "brand": "NZXT",
        "price": 129.99,
        "description": "Caja ATX con panel frontal perforado para máximo flujo de aire y gestión de cables sencilla.",
        "category": "Cajas/Torres",
        "stock": 18,
        "image": "",
    },
    {
        "name": "Noctua NH-D15 chromax.black",
        "brand": "Noctua",
        "price": 109.99,
        "description": "Disipador CPU de doble torre con dos ventiladores NF-A15 PWM, rendimiento de referencia.",
        "category": "Refrigeración",
        "stock": 22,
        "image": "",
    },
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Admin por defecto
        existing = db.query(User).filter(User.email == "admin@geeklab.local").first()
        if not existing:
            admin = User(
                username="admin",
                email="admin@geeklab.local",
                password=hash_password("Admin123!"),
                role="admin",
            )
            db.add(admin)
            print("✓ Admin creado: admin@geeklab.local / Admin123!")
        else:
            print("→ Admin ya existe, omitiendo.")

        # Productos demo
        count = db.query(Product).count()
        if count == 0:
            for p in PRODUCTS:
                db.add(Product(**p))
            print(f"✓ {len(PRODUCTS)} productos demo creados.")
        else:
            print(f"→ Ya hay {count} productos, omitiendo seed de productos.")

        db.commit()
        print("Seed completado.")
    except Exception as e:
        db.rollback()
        print(f"Error en seed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
