-- Habilitar extensión uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    UNIQUE (name)
);

-- Insertar datos de ejemplo
INSERT INTO products (id, name, description, price, stock) VALUES
    (uuid_generate_v4(), 'Laptop HP Pavilion', 'Laptop 15.6" Intel Core i5, 8GB RAM, 256GB SSD', 799.99, 25),
    (uuid_generate_v4(), 'Mouse Logitech MX Master 3', 'Mouse inalámbrico ergonómico con scroll electromagnético', 99.99, 50),
    (uuid_generate_v4(), 'Teclado Mecánico Keychron K2', 'Teclado mecánico 75% con switches Gateron Brown', 89.00, 30),
    (uuid_generate_v4(), 'Monitor Dell 27"', 'Monitor IPS 4K UHD, 60Hz, USB-C', 449.99, 15),
    (uuid_generate_v4(), 'Webcam Logitech C920', 'Webcam Full HD 1080p con micrófono estéreo', 79.99, 40),
    (uuid_generate_v4(), 'Auriculares Sony WH-1000XM4', 'Auriculares inalámbricos con cancelación de ruido', 349.99, 20),
    (uuid_generate_v4(), 'SSD Samsung 970 EVO Plus 1TB', 'SSD NVMe M.2 con velocidad de lectura 3500MB/s', 129.99, 60),
    (uuid_generate_v4(), 'Memoria RAM Corsair 16GB', 'DDR4 3200MHz, kit de 2x8GB', 69.99, 45),
    (uuid_generate_v4(), 'Cargador USB-C 65W', 'Cargador GaN compacto con múltiples puertos', 45.99, 100),
    (uuid_generate_v4(), 'Cable HDMI 2.1 4K', 'Cable HDMI de alta velocidad, 2 metros', 19.99, 200)
ON CONFLICT (name) DO NOTHING;
