-- Create pedido_produto table (N:N relationship)
CREATE TABLE IF NOT EXISTS pedido_produto (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pedido_id, produto_id)
);

