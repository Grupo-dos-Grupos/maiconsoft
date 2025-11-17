const { getQuery, allQuery, runQuery } = require("../config/database");

class Pedido {
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      clienteId,
      status,
      excludeConcluidos,
    } = options;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT p.*, c.nome as cliente_nome, c.email as cliente_email
      FROM pedidos p
      INNER JOIN clientes c ON p.cliente_id = c.id
      WHERE p.deleted = FALSE
    `;
    const params = [];

    // Excluir pedidos concluídos por padrão (a menos que status='concluido' seja explicitamente solicitado)
    if (status !== "concluido" && excludeConcluidos !== false) {
      sql += ` AND p.status != 'concluido'`;
    }

    if (clienteId) {
      sql += ` AND p.cliente_id = $${params.length + 1}`;
      params.push(clienteId);
    }

    if (status) {
      sql += ` AND p.status = $${params.length + 1}`;
      params.push(status);
    }

    // Contar total
    const countSql = sql.replace(
      /SELECT.*FROM/,
      "SELECT COUNT(*) as total FROM"
    );
    const countResult = await getQuery(countSql, params);
    const total = parseInt(countResult?.total || 0);

    // Buscar dados paginados
    sql += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(parseInt(limit), offset);

    const rows = await allQuery(sql, params);

    // Buscar produtos de cada pedido e converter total para número
    for (const pedido of rows) {
      // Converter total para número (PostgreSQL retorna numeric como string)
      if (pedido.total !== null && pedido.total !== undefined) {
        pedido.total = parseFloat(pedido.total);
      }
      pedido.produtos = await this.getProdutosByPedidoId(pedido.id);
    }

    return {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findById(id) {
    const pedido = await getQuery(
      `
      SELECT p.*, c.nome as cliente_nome, c.email as cliente_email, c.telefone as cliente_telefone
      FROM pedidos p
      INNER JOIN clientes c ON p.cliente_id = c.id
      WHERE p.id = $1 AND p.deleted = FALSE
    `,
      [id]
    );

    if (pedido) {
      // Converter total para número (PostgreSQL retorna numeric como string)
      if (pedido.total !== null && pedido.total !== undefined) {
        pedido.total = parseFloat(pedido.total);
      }
      pedido.produtos = await this.getProdutosByPedidoId(id);
    }

    return pedido;
  }

  static async getProdutosByPedidoId(pedidoId) {
    return await allQuery(
      `
      SELECT 
        pp.id,
        pp.quantidade,
        pp.preco_unitario,
        pp.subtotal,
        pr.id as produto_id,
        pr.nome as produto_nome,
        pr.descricao as produto_descricao
      FROM pedido_produto pp
      INNER JOIN produtos pr ON pp.produto_id = pr.id
      WHERE pp.pedido_id = $1
      ORDER BY pr.nome
    `,
      [pedidoId]
    );
  }

  static async create(data) {
    const { clienteId, produtos, status = "pendente" } = data;

    if (!clienteId) {
      throw new Error("clienteId é obrigatório");
    }

    if (!produtos || produtos.length === 0) {
      throw new Error("Pedido deve ter pelo menos um produto");
    }

    // Calcular total
    let total = 0;
    for (const item of produtos) {
      const produto = await getQuery(
        "SELECT preco FROM produtos WHERE id = $1 AND deleted = FALSE",
        [item.produtoId]
      );
      if (!produto) {
        throw new Error(`Produto com id ${item.produtoId} não encontrado`);
      }
      total += parseFloat(produto.preco) * parseInt(item.quantidade);
    }

    // Criar pedido
    const pedidoSql = `
      INSERT INTO pedidos (cliente_id, status, total)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const pedidoResult = await runQuery(pedidoSql, [clienteId, status, total]);
    const pedido = pedidoResult.rows[0];

    // Adicionar produtos ao pedido
    for (const item of produtos) {
      const produto = await getQuery(
        "SELECT preco FROM produtos WHERE id = $1 AND deleted = FALSE",
        [item.produtoId]
      );
      const precoUnitario = parseFloat(produto.preco);
      const quantidade = parseInt(item.quantidade);
      const subtotal = precoUnitario * quantidade;

      await runQuery(
        `
        INSERT INTO pedido_produto (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (pedido_id, produto_id) 
        DO UPDATE SET 
          quantidade = EXCLUDED.quantidade,
          preco_unitario = EXCLUDED.preco_unitario,
          subtotal = EXCLUDED.subtotal
      `,
        [pedido.id, item.produtoId, quantidade, precoUnitario, subtotal]
      );
    }

    // Recalcular total (garantir precisão)
    await this.recalculateTotal(pedido.id);

    return await this.findById(pedido.id);
  }

  static async update(id, data) {
    const { status, produtos } = data;

    const pedido = await getQuery(
      "SELECT * FROM pedidos WHERE id = $1 AND deleted = FALSE",
      [id]
    );
    if (!pedido) {
      return null;
    }

    // Bloquear completamente a edição se o pedido estiver concluído
    if (pedido.status === "concluido") {
      throw new Error("Não é possível editar um pedido concluído");
    }

    // Atualizar status se fornecido
    if (status) {
      await runQuery(
        `
        UPDATE pedidos 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
        [status, id]
      );
    }

    // Atualizar produtos se fornecido
    if (produtos && Array.isArray(produtos) && produtos.length > 0) {
      // Remover produtos antigos
      await runQuery("DELETE FROM pedido_produto WHERE pedido_id = $1", [id]);

      // Adicionar novos produtos
      for (const item of produtos) {
        const produto = await getQuery(
          "SELECT preco FROM produtos WHERE id = $1 AND deleted = FALSE",
          [item.produtoId]
        );
        if (!produto) {
          throw new Error(`Produto com id ${item.produtoId} não encontrado`);
        }
        const precoUnitario = parseFloat(produto.preco);
        const quantidade = parseInt(item.quantidade);
        const subtotal = precoUnitario * quantidade;

        await runQuery(
          `
          INSERT INTO pedido_produto (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
          VALUES ($1, $2, $3, $4, $5)
        `,
          [id, item.produtoId, quantidade, precoUnitario, subtotal]
        );
      }

      // Recalcular total
      await this.recalculateTotal(id);
    }

    return await this.findById(id);
  }

  static async recalculateTotal(pedidoId) {
    const result = await getQuery(
      `
      SELECT COALESCE(SUM(subtotal), 0) as total
      FROM pedido_produto
      WHERE pedido_id = $1
    `,
      [pedidoId]
    );

    const total = parseFloat(result.total || 0);

    await runQuery(
      `
      UPDATE pedidos 
      SET total = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
      [total, pedidoId]
    );

    return total;
  }

  static async delete(id) {
    const sql = `
      UPDATE pedidos 
      SET deleted = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted = FALSE
      RETURNING id
    `;
    const result = await runQuery(sql, [id]);
    return result.rowCount > 0;
  }

  static async countAtivos() {
    const result = await getQuery(
      "SELECT COUNT(*) as total FROM pedidos WHERE deleted = FALSE"
    );
    return parseInt(result?.total || 0);
  }

  static async countMesAtual() {
    const result = await getQuery(`
      SELECT COUNT(*) as total FROM pedidos 
      WHERE deleted = FALSE 
      AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);
    return parseInt(result?.total || 0);
  }

  static async getTotalVendas() {
    const result = await getQuery(
      "SELECT COALESCE(SUM(total), 0) as total FROM pedidos WHERE deleted = FALSE"
    );
    return parseFloat(result?.total || 0);
  }

  static async getPorStatus() {
    const rows = await allQuery(`
      SELECT status, COUNT(*) as total 
      FROM pedidos 
      WHERE deleted = FALSE 
      GROUP BY status
    `);
    return rows.map((item) => ({
      status: item.status,
      total: parseInt(item.total || 0),
    }));
  }

  static async getVendasPorMes(months = 6) {
    const rows = await allQuery(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as mes,
        COALESCE(SUM(total), 0) as total
      FROM pedidos 
      WHERE deleted = FALSE 
      AND created_at >= CURRENT_DATE - INTERVAL '${parseInt(months)} months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY mes DESC
    `);
    return rows.map((item) => ({
      mes: item.mes,
      total: parseFloat(item.total || 0),
    }));
  }
}

module.exports = Pedido;
