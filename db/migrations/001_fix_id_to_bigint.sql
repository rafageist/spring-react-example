-- Migración: Cambiar id de INTEGER (SERIAL) a BIGINT (BIGSERIAL)
-- Ejecutar: docker exec -i example1-db-1 psql -U postgres -d example < db/migrations/001_fix_id_to_bigint.sql

-- Cambiar el tipo de la columna id
ALTER TABLE products ALTER COLUMN id TYPE BIGINT;

-- Cambiar la secuencia para que genere BIGINT
ALTER SEQUENCE products_id_seq AS BIGINT;
