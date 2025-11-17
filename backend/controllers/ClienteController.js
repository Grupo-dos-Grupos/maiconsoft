const Cliente = require("../models/Cliente");

class ClienteController {
  static async list(req, res, next) {
    try {
      const { page = 1, limit = 10, search, tipo, estado } = req.query;
      const result = await Cliente.findAll({
        page,
        limit,
        search,
        tipo,
        estado,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async show(req, res, next) {
    try {
      const { id } = req.params;
      const cliente = await Cliente.findById(id);

      if (!cliente) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      res.json(cliente);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { nome, razao, email, telefone, codigo } = req.body;

      // Usar razao se fornecido, senão usar nome
      const nomeCliente = razao || nome;

      if (!nomeCliente) {
        return res
          .status(400)
          .json({ error: "Nome ou Razão Social é obrigatório" });
      }

      // Verificar se email já existe
      if (email) {
        const existing = await Cliente.findByEmail(email);
        if (existing) {
          return res.status(400).json({ error: "Email já cadastrado" });
        }
      }

      // Verificar se código já existe
      if (codigo) {
        const existing = await Cliente.findByCodigo(codigo);
        if (existing) {
          return res.status(400).json({ error: "Código já cadastrado" });
        }
      }

      // Passar todos os campos para o modelo
      const cliente = await Cliente.create(req.body);
      res.status(201).json(cliente);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);

      // Verificar se é erro de coluna não encontrada
      if (
        error.message &&
        error.message.includes("column") &&
        error.message.includes("does not exist")
      ) {
        return res.status(500).json({
          error: "Erro",
          message: "Execute as migrations: npm run migrate",
          details: error.message,
        });
      }

      res.status(500).json({
        error: "Erro ao criar cliente",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nome, razao, email, codigo } = req.body;

      const cliente = await Cliente.findById(id);
      if (!cliente) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      // Verificar se email já existe em outro cliente
      if (email && email !== cliente.email) {
        const existing = await Cliente.findByEmail(email);
        if (existing) {
          return res.status(400).json({ error: "Email já cadastrado" });
        }
      }

      // Verificar se código já existe em outro cliente
      if (codigo && codigo !== cliente.codigo) {
        const existing = await Cliente.findByCodigo(codigo);
        if (existing) {
          return res.status(400).json({ error: "Código já cadastrado" });
        }
      }

      // Passar todos os campos para o modelo
      const updated = await Cliente.update(id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await Cliente.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: "Cliente não encontrado" });
      }

      res.json({ message: "Cliente excluído com sucesso" });
    } catch (error) {
      next(error);
    }
  }

  static async restore(req, res, next) {
    try {
      const { id } = req.params;
      const cliente = await Cliente.restore(id);

      if (!cliente) {
        return res
          .status(404)
          .json({ error: "Cliente não encontrado ou já está ativo" });
      }

      res.json({ message: "Cliente restaurado com sucesso", cliente });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ClienteController;
