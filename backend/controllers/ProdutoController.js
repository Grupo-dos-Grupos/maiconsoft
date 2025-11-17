const Produto = require('../models/Produto');
const { generateProductDescription } = require('../services/openaiService');

class ProdutoController {
  static async list(req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const result = await Produto.findAll({ page, limit, search });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async show(req, res, next) {
    try {
      const { id } = req.params;
      const produto = await Produto.findById(id);
      
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      res.json(produto);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { nome, preco, descricao, generateDescription = false } = req.body;

      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      if (!preco || preco <= 0) {
        return res.status(400).json({ error: 'Preço deve ser maior que zero' });
      }

      let finalDescricao = descricao;

      // Gerar descrição usando IA se solicitado
      if (generateDescription && !descricao) {
        try {
          finalDescricao = await generateProductDescription(nome);
        } catch (error) {
          console.warn('Erro ao gerar descrição com Gemini:', error.message);
          // Continuar sem descrição se a IA falhar
        }
      }

      const produto = await Produto.create({ nome, preco, descricao: finalDescricao });
      res.status(201).json(produto);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nome, preco, descricao } = req.body;

      const produto = await Produto.findById(id);
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      if (preco !== undefined && preco <= 0) {
        return res.status(400).json({ error: 'Preço deve ser maior que zero' });
      }

      const updated = await Produto.update(id, { nome, preco, descricao });
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await Produto.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      res.json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProdutoController;

