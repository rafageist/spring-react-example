-- Migration: Add warehouse management tables (users, categories, locations)
-- and update products with new relationships

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#1890ff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de localizaciones (zonas del almacén)
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    x DOUBLE PRECISION NOT NULL DEFAULT 0,
    y DOUBLE PRECISION NOT NULL DEFAULT 0,
    width DOUBLE PRECISION NOT NULL DEFAULT 100,
    height DOUBLE PRECISION NOT NULL DEFAULT 100,
    color VARCHAR(7) DEFAULT '#e6f7ff',
    border_color VARCHAR(7) DEFAULT '#1890ff',
    capacity INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar nuevas columnas a products
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS pos_x DOUBLE PRECISION DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pos_y DOUBLE PRECISION DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_location ON products(location_id);
CREATE INDEX IF NOT EXISTS idx_products_owner ON products(owner_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Insertar usuario demo (password: demo123)
INSERT INTO users (username, password, full_name, role, enabled) VALUES
    ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqvV0/jx.1Hiv1pGQm4BtFTPvCc5.', 'Administrador', 'ADMIN', true),
    ('demo', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqvV0/jx.1Hiv1pGQm4BtFTPvCc5.', 'Usuario Demo', 'USER', true)
ON CONFLICT (username) DO NOTHING;

-- Insertar categorías de ejemplo
INSERT INTO categories (name, description, color) VALUES
    ('Electrónica', 'Dispositivos electrónicos y componentes', '#1890ff'),
    ('Periféricos', 'Teclados, ratones, webcams y accesorios', '#52c41a'),
    ('Almacenamiento', 'Discos duros, SSDs y memorias', '#722ed1'),
    ('Audio', 'Auriculares, altavoces y equipos de sonido', '#eb2f96'),
    ('Cables', 'Cables y conectores varios', '#faad14')
ON CONFLICT (name) DO NOTHING;

-- Insertar localizaciones del almacén (zonas)
INSERT INTO locations (name, description, x, y, width, height, color, border_color, capacity) VALUES
    ('Zona A - Entrada', 'Zona de recepción y entrada de mercancía', 50, 50, 200, 150, '#fff7e6', '#fa8c16', 50),
    ('Zona B - Electrónica', 'Almacén de productos electrónicos', 300, 50, 250, 200, '#e6f7ff', '#1890ff', 100),
    ('Zona C - Periféricos', 'Almacén de periféricos y accesorios', 600, 50, 200, 150, '#f6ffed', '#52c41a', 80),
    ('Zona D - Audio', 'Almacén de productos de audio', 50, 250, 200, 200, '#fff0f6', '#eb2f96', 60),
    ('Zona E - Almacenamiento', 'Zona de discos y memorias', 300, 300, 200, 150, '#f9f0ff', '#722ed1', 120),
    ('Zona F - Cables', 'Zona de cables y conectores', 550, 250, 150, 200, '#fffbe6', '#faad14', 200),
    ('Zona G - Salida', 'Zona de preparación de pedidos', 750, 300, 150, 150, '#f0f5ff', '#2f54eb', 40)
ON CONFLICT DO NOTHING;
