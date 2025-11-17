const Pedido = require('../models/Pedido');

class PedidoController {
  static async list(req, res, next) {
    try {
      const { page = 1, limit = 10, clienteId, status, excludeConcluidos } = req.query;
      const options = { 
        page, 
        limit, 
        clienteId, 
        status,
        excludeConcluidos: excludeConcluidos !== 'false' // Por padrão exclui concluídos, a menos que seja explicitamente 'false'
      };
      const result = await Pedido.findAll(options);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async show(req, res, next) {
    try {
      const { id } = req.params;
      const pedido = await Pedido.findById(id);
      
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      res.json(pedido);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { clienteId, produtos, status } = req.body;

      if (!clienteId) {
        return res.status(400).json({ error: 'clienteId é obrigatório' });
      }

      if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
        return res.status(400).json({ error: 'Pedido deve ter pelo menos um produto' });
      }

      // Validar produtos
      for (const item of produtos) {
        if (!item.produtoId || !item.quantidade) {
          return res.status(400).json({ error: 'Cada produto deve ter produtoId e quantidade' });
        }
        if (item.quantidade <= 0) {
          return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
        }
      }

      const pedido = await Pedido.create({ clienteId, produtos, status });
      res.status(201).json(pedido);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { status, produtos } = req.body;

      const pedido = await Pedido.findById(id);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      // Bloquear completamente a edição se o pedido estiver concluído
      if (pedido.status === 'concluido') {
        return res.status(400).json({ 
          error: 'Não é possível editar um pedido concluído' 
        });
      }

      if (status && !['pendente', 'processando', 'concluido', 'cancelado'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }

      if (produtos && Array.isArray(produtos) && produtos.length > 0) {
        // Validar produtos
        for (const item of produtos) {
          if (!item.produtoId || !item.quantidade) {
            return res.status(400).json({ error: 'Cada produto deve ter produtoId e quantidade' });
          }
          if (item.quantidade <= 0) {
            return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
          }
        }
      }

      const updated = await Pedido.update(id, { status, produtos });
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await Pedido.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      res.json({ message: 'Pedido excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PedidoController;

