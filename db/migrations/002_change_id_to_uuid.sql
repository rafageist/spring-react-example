-- Migración: Cambiar id de BIGINT a UUID v4
-- Ejecutar: docker exec -i example1-db-1 psql -U postgres -d example < db/migrations/002_change_id_to_uuid.sql

-- Habilitar extensión uuid-ossp si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agregar columna temporal con UUID
ALTER TABLE products ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();

-- Actualizar los UUIDs para registros existentes
UPDATE products SET new_id = uuid_generate_v4() WHERE new_id IS NULL;

-- Eliminar la columna id antigua y la secuencia
ALTER TABLE products DROP COLUMN id;

-- Renombrar new_id a id
ALTER TABLE products RENAME COLUMN new_id TO id;

-- Hacer id NOT NULL y PRIMARY KEY
ALTER TABLE products ALTER COLUMN id SET NOT NULL;
ALTER TABLE products ADD PRIMARY KEY (id);

-- Establecer valor por defecto para nuevos registros
ALTER TABLE products ALTER COLUMN id SET DEFAULT uuid_generate_v4();
