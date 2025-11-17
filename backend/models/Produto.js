const { getQuery, allQuery, runQuery } = require('../config/database');

class Produto {
  static async findAll(options = {}) {
    const { page = 1, limit = 10, search } = options;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM produtos WHERE deleted = FALSE';
    const params = [];

    if (search) {
      sql += ' AND (nome ILIKE $1 OR descricao ILIKE $1)';
      params.push(`%${search}%`);
    }

    // Contar total
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await getQuery(countSql, params);
    const total = parseInt(countResult?.total || 0);

    // Buscar dados paginados
    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const rows = await allQuery(sql, params);

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
    return await getQuery('SELECT * FROM produtos WHERE id = $1 AND deleted = FALSE', [id]);
  }

  static async create(data) {
    const { nome, preco, descricao } = data;
    const sql = `
      INSERT INTO produtos (nome, preco, descricao)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await runQuery(sql, [nome, parseFloat(preco), descricao || null]);
    return result.rows[0];
  }

  static async update(id, data) {
    const { nome, preco, descricao } = data;
    const sql = `
      UPDATE produtos 
      SET nome = COALESCE($1, nome),
          preco = COALESCE($2, preco),
          descricao = COALESCE($3, descricao),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND deleted = FALSE
      RETURNING *
    `;
    const result = await runQuery(sql, [nome, preco ? parseFloat(preco) : null, descricao, id]);
    return result.rows[0] || null;
  }

  static async delete(id) {
    const sql = `
      UPDATE produtos 
      SET deleted = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted = FALSE
      RETURNING id
    `;
    const result = await runQuery(sql, [id]);
    return result.rowCount > 0;
  }

  static async countAtivos() {
    const result = await getQuery(
      'SELECT COUNT(*) as total FROM produtos WHERE deleted = FALSE'
    );
    return parseInt(result?.total || 0);
  }
}

module.exports = Produto;

