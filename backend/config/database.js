const { Pool } = require('pg');
const path = require('path');

// Configuração do banco PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sistema_pedidos',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão PostgreSQL:', err);
});

// Função para executar queries
async function runQuery(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount,
      id: result.rows[0]?.id || null,
    };
  } finally {
    client.release();
  }
}

// Função para buscar um registro
async function getQuery(sql, params = []) {
  const result = await runQuery(sql, params);
  return result.rows[0] || null;
}

// Função para buscar múltiplos registros
async function allQuery(sql, params = []) {
  const result = await runQuery(sql, params);
  return result.rows;
}

// Inicializar tabelas do banco
async function initDatabase() {
  try {
    // Tabela de Clientes
    await runQuery(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        telefone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted BOOLEAN DEFAULT FALSE
      )
    `);

    // Tabela de Produtos
    await runQuery(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        preco DECIMAL(10, 2) NOT NULL CHECK (preco >= 0),
        descricao TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted BOOLEAN DEFAULT FALSE
      )
    `);

    // Tabela de Pedidos
    await runQuery(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER NOT NULL REFERENCES clientes(id),
        data DATE DEFAULT CURRENT_DATE,
        status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'concluido', 'cancelado')),
        total DECIMAL(10, 2) DEFAULT 0 CHECK (total >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted BOOLEAN DEFAULT FALSE
      )
    `);

    // Tabela intermediária PedidoProduto (N:N)
    await runQuery(`
      CREATE TABLE IF NOT EXISTS pedido_produto (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
        produto_id INTEGER NOT NULL REFERENCES produtos(id),
        quantidade INTEGER NOT NULL CHECK (quantidade > 0),
        preco_unitario DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(pedido_id, produto_id)
      )
    `);

    // Índices para performance
    await runQuery(`
      CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
      CREATE INDEX IF NOT EXISTS idx_pedido_produto_pedido ON pedido_produto(pedido_id);
      CREATE INDEX IF NOT EXISTS idx_pedido_produto_produto ON pedido_produto(produto_id);
    `);

    console.log('✅ Tabelas criadas/verificadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    throw error;
  }
}

module.exports = {
  pool,
  runQuery,
  getQuery,
  allQuery,
  initDatabase,
};

