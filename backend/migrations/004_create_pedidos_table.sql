-- Create pedidos table
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  data DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'concluido', 'cancelado')),
  total DECIMAL(10, 2) DEFAULT 0 CHECK (total >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted BOOLEAN DEFAULT FALSE
);

