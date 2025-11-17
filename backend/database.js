const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o banco de dados
const dbPath = path.join(__dirname, 'clientes.db');

// Criar conexão com o banco
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco SQLite');
    initDatabase();
  }
});

// Inicializar tabela de clientes
function initDatabase() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE NOT NULL,
      loja TEXT NOT NULL,
      razao TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('J', 'F')),
      nomefantasia TEXT,
      finalidade TEXT CHECK (finalidade IN ('C', 'F')),
      cnpj TEXT UNIQUE,
      cep TEXT,
      pais TEXT,
      estado TEXT,
      codmunicipio TEXT,
      cidade TEXT,
      endereco TEXT,
      bairro TEXT,
      ddd TEXT,
      telefone TEXT,
      abertura DATE,
      contato TEXT,
      email TEXT,
      homepage TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted BOOLEAN DEFAULT 0
    )
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('Erro ao criar tabela:', err.message);
    } else {
      console.log('Tabela clientes criada/verificada com sucesso');
    }
  });
}

// Função para executar queries
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Função para buscar dados
function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Função para buscar múltiplos dados
function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  db,
  runQuery,
  getQuery,
  allQuery
};
