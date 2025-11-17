-- Add numero column to clientes table
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS numero VARCHAR(20);

