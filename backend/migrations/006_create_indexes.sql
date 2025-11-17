-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedido_produto_pedido ON pedido_produto(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_produto_produto ON pedido_produto(produto_id);

