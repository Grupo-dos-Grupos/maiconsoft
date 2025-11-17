-- Update codmunicipio column size to accommodate IBGE codes (7 digits)
ALTER TABLE clientes 
ALTER COLUMN codmunicipio TYPE VARCHAR(7);

