-- Add all missing fields to clientes table
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS codigo VARCHAR(6),
ADD COLUMN IF NOT EXISTS loja VARCHAR(2),
ADD COLUMN IF NOT EXISTS tipo VARCHAR(1),
ADD COLUMN IF NOT EXISTS nomefantasia VARCHAR(60),
ADD COLUMN IF NOT EXISTS finalidade VARCHAR(1),
ADD COLUMN IF NOT EXISTS cnpj VARCHAR(14),
ADD COLUMN IF NOT EXISTS cep VARCHAR(8),
ADD COLUMN IF NOT EXISTS pais VARCHAR(3),
ADD COLUMN IF NOT EXISTS estado VARCHAR(2),
ADD COLUMN IF NOT EXISTS codmunicipio VARCHAR(7),
ADD COLUMN IF NOT EXISTS cidade VARCHAR(50),
ADD COLUMN IF NOT EXISTS endereco VARCHAR(60),
ADD COLUMN IF NOT EXISTS bairro VARCHAR(30),
ADD COLUMN IF NOT EXISTS ddd VARCHAR(3),
ADD COLUMN IF NOT EXISTS contato VARCHAR(50),
ADD COLUMN IF NOT EXISTS homepage VARCHAR(100),
ADD COLUMN IF NOT EXISTS abertura DATE;

-- Add unique constraint on codigo if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clientes_codigo_key'
  ) THEN
    ALTER TABLE clientes ADD CONSTRAINT clientes_codigo_key UNIQUE (codigo);
  END IF;
END $$;

-- Add unique constraint on cnpj if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clientes_cnpj_key'
  ) THEN
    ALTER TABLE clientes ADD CONSTRAINT clientes_cnpj_key UNIQUE (cnpj);
  END IF;
END $$;

