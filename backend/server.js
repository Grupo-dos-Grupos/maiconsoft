// Carregar variáveis de ambiente PRIMEIRO
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { runQuery, getQuery, allQuery } = require("./config/database");
//const { initDatabase } = require('./config/database');

// Routes
const clientesRoutes = require("./routes/clientes");
const produtosRoutes = require("./routes/produtos");
const pedidosRoutes = require("./routes/pedidos");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas da API
app.use("/api/clientes", clientesRoutes);
app.use("/api/produtos", produtosRoutes);
app.use("/api/pedidos", pedidosRoutes);

// Health check
//app.get('/api/health', async (req, res) => {
// try {
//    res.json({
//      data: clientes,
//      pagination: {
//        page: parseInt(page),
//        limit: parseInt(limit),
//       total,
//        totalPages: Math.ceil(total / limit)
//      }
//    });
//  } catch (error) {
//    console.error('Erro ao buscar clientes:', error);
//    res.status(500).json({ error: 'Erro interno do servidor' });
//  }
//});

// GET /api/clientes/:id - Buscar cliente por ID
app.get("/api/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await getQuery(
      "SELECT * FROM clientes WHERE id = ? AND deleted = 0",
      [id]
    );

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// POST /api/clientes - Criar novo cliente
app.post("/api/clientes", async (req, res) => {
  try {
    const clienteData = req.body;

    // Validar campos obrigatórios
    if (
      !clienteData.codigo ||
      !clienteData.loja ||
      !clienteData.razao ||
      !clienteData.tipo
    ) {
      return res
        .status(400)
        .json({ error: "Campos obrigatórios: codigo, loja, razao, tipo" });
    }

    // Novas Validações
    if (clienteData.telefone && !/^\d{8,9}$/.test(clienteData.telefone)) {
      return res
        .status(400)
        .json({ error: "Telefone deve ter 8 ou 9 dígitos" });
    }

    if (
      clienteData.codmunicipio &&
      !/^\d{5,7}$/.test(clienteData.codmunicipio)
    ) {
      return res
        .status(400)
        .json({ error: "Código do município deve ter entre 5 e 7 dígitos" });
    }

    // Verificar se código já existe
    const existingCodigo = await getQuery(
      "SELECT id FROM clientes WHERE codigo = ? AND deleted = 0",
      [clienteData.codigo]
    );
    if (existingCodigo) {
      return res.status(400).json({ error: "Código já existe" });
    }

    // Verificar se CNPJ já existe (se fornecido)
    if (clienteData.cnpj) {
      const existingCnpj = await getQuery(
        "SELECT id FROM clientes WHERE cnpj = ? AND deleted = 0",
        [clienteData.cnpj]
      );
      if (existingCnpj) {
        return res.status(400).json({ error: "CNPJ já existe" });
      }
    }

    const sql = `
      INSERT INTO clientes (
        codigo, loja, razao, tipo, nomefantasia, finalidade, cnpj, cep,
        pais, estado, codmunicipio, cidade, endereco, bairro, ddd, telefone,
        abertura, contato, email, homepage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      clienteData.codigo,
      clienteData.loja,
      clienteData.razao,
      clienteData.tipo,
      clienteData.nomefantasia || null,
      clienteData.finalidade || null,
      clienteData.cnpj || null,
      clienteData.cep || null,
      clienteData.pais || null,
      clienteData.estado || null,
      clienteData.codmunicipio || null,
      clienteData.cidade || null,
      clienteData.endereco || null,
      clienteData.bairro || null,
      clienteData.ddd || null,
      clienteData.telefone || null,
      clienteData.abertura || null,
      clienteData.contato || null,
      clienteData.email || null,
      clienteData.homepage || null,
    ];

    const result = await runQuery(sql, params);

    // Buscar o cliente criado
    const novoCliente = await getQuery("SELECT * FROM clientes WHERE id = ?", [
      result.id,
    ]);

    res.status(201).json(novoCliente);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// PUT /api/clientes/:id - Atualizar cliente
app.put("/api/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const clienteData = req.body;

    // Novas Validações
    if (clienteData.telefone && !/^\d{8,9}$/.test(clienteData.telefone)) {
      return res
        .status(400)
        .json({ error: "Telefone deve ter 8 ou 9 dígitos" });
    }

    if (
      clienteData.codmunicipio &&
      !/^\d{5,7}$/.test(clienteData.codmunicipio)
    ) {
      return res
        .status(400)
        .json({ error: "Código do município deve ter entre 5 e 7 dígitos" });
    }

    // Verificar se cliente existe
    const existingCliente = await getQuery(
      "SELECT * FROM clientes WHERE id = ? AND deleted = 0",
      [id]
    );
    if (!existingCliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    // Verificar se código já existe em outro cliente
    if (clienteData.codigo && clienteData.codigo !== existingCliente.codigo) {
      const existingCodigo = await getQuery(
        "SELECT id FROM clientes WHERE codigo = ? AND deleted = 0 AND id != ?",
        [clienteData.codigo, id]
      );
      if (existingCodigo) {
        return res.status(400).json({ error: "Código já existe" });
      }
    }

    // Verificar se CNPJ já existe em outro cliente
    if (clienteData.cnpj && clienteData.cnpj !== existingCliente.cnpj) {
      const existingCnpj = await getQuery(
        "SELECT id FROM clientes WHERE cnpj = ? AND deleted = 0 AND id != ?",
        [clienteData.cnpj, id]
      );
      if (existingCnpj) {
        return res.status(400).json({ error: "CNPJ já existe" });
      }
    }

    const sql = `
      UPDATE clientes SET
        codigo = ?, loja = ?, razao = ?, tipo = ?, nomefantasia = ?, finalidade = ?,
        cnpj = ?, cep = ?, pais = ?, estado = ?, codmunicipio = ?, cidade = ?,
        endereco = ?, bairro = ?, ddd = ?, telefone = ?, abertura = ?, contato = ?,
        email = ?, homepage = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [
      clienteData.codigo || existingCliente.codigo,
      clienteData.loja || existingCliente.loja,
      clienteData.razao || existingCliente.razao,
      clienteData.tipo || existingCliente.tipo,
      clienteData.nomefantasia || existingCliente.nomefantasia,
      clienteData.finalidade || existingCliente.finalidade,
      clienteData.cnpj || existingCliente.cnpj,
      clienteData.cep || existingCliente.cep,
      clienteData.pais || existingCliente.pais,
      clienteData.estado || existingCliente.estado,
      clienteData.codmunicipio || existingCliente.codmunicipio,
      clienteData.cidade || existingCliente.cidade,
      clienteData.endereco || existingCliente.endereco,
      clienteData.bairro || existingCliente.bairro,
      clienteData.ddd || existingCliente.ddd,
      clienteData.telefone || existingCliente.telefone,
      clienteData.abertura || existingCliente.abertura,
      clienteData.contato || existingCliente.contato,
      clienteData.email || existingCliente.email,
      clienteData.homepage || existingCliente.homepage,
      id,
    ];

    await runQuery(sql, params);

    // Buscar o cliente atualizado
    const clienteAtualizado = await getQuery(
      "SELECT * FROM clientes WHERE id = ?",
      [id]
    );

    res.json(clienteAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// DELETE /api/clientes/:id - Soft delete do cliente
app.delete("/api/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await runQuery(
      "UPDATE clientes SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json({ message: "Cliente excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET /api/validar-cnpj/:cnpj - Validar CNPJ na ReceitaWS
app.get("/api/validar-cnpj/:cnpj", async (req, res) => {
  try {
    const { cnpj } = req.params;

    // Remove caracteres não numéricos
    const cnpjLimpo = cnpj.replace(/\D/g, "");

    // Validação básica de formato
    if (cnpjLimpo.length !== 14) {
      return res.status(400).json({ error: "CNPJ deve ter 14 dígitos" });
    }

    // Buscar dados do CNPJ na ReceitaWS
    const axios = require("axios");
    const response = await axios.get(
      `https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`,
      {
        timeout: 10000,
      }
    );

    if (response.data.status === "ERROR") {
      return res.status(404).json({ error: "CNPJ não encontrado ou inválido" });
    }

    res.json(response.data);
  } catch (error) {
    console.error("Erro ao validar CNPJ:", error);
    if (error.response) {
      return res
        .status(error.response.status)
        .json({ error: "Erro ao consultar CNPJ" });
    }
    res.status(500).json({ error: "Erro ao validar CNPJ" });
  }
});

// GET /api/buscar-cep/:cep - Buscar dados do CEP
app.get("/api/buscar-cep/:cep", async (req, res) => {
  try {
    const { cep } = req.params;
    const axios = require("axios");

    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    const data = response.data;

    if (data.erro) {
      return res.status(404).json({ error: "CEP não encontrado" });
    }

    res.json(data);
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    if (error.response) {
      return res
        .status(error.response.status)
        .json({ error: "Erro ao buscar CEP" });
    }
    res.status(500).json({ error: "Erro ao buscar CEP" });
  }
});

// Rota de health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Inicializar banco de dados e servidor
async function startServer() {
  try {
    // Inicializar PostgreSQL
    //await initDatabase();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/api/health`);
      console.log(`👥 Clientes: http://localhost:${PORT}/api/clientes`);
      console.log(`📦 Produtos: http://localhost:${PORT}/api/produtos`);
      console.log(`🛒 Pedidos: http://localhost:${PORT}/api/pedidos`);
    });
  } catch (error) {
    console.error("Erro ao validar CNPJ:", error);
  }
}

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Exportar app para testes
module.exports = app;

// Iniciar servidor apenas se não estiver em modo de teste
if (process.env.NODE_ENV !== "test") {
  startServer();
}
