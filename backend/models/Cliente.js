const { getQuery, allQuery, runQuery } = require("../config/database");

class Cliente {
  static async findAll(options = {}) {
    const { page = 1, limit = 10, search, tipo, estado } = options;
    const offset = (page - 1) * limit;

    let sql = "SELECT * FROM clientes WHERE deleted = FALSE";
    const params = [];
    let paramIndex = 1;

    if (search) {
      sql += ` AND (nome ILIKE $${paramIndex} OR codigo ILIKE $${paramIndex} OR cnpj ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (tipo) {
      sql += ` AND tipo = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }

    if (estado) {
      sql += ` AND estado = $${paramIndex}`;
      params.push(estado);
      paramIndex++;
    }

    // Contar total
    const countSql = sql.replace("SELECT *", "SELECT COUNT(*) as total");
    const countResult = await getQuery(countSql, params);
    const total = parseInt(countResult?.total || 0);

    // Buscar dados paginados
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`;
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
    return await getQuery(
      "SELECT * FROM clientes WHERE id = $1 AND deleted = FALSE",
      [id]
    );
  }

  static async findByEmail(email) {
    return await getQuery(
      "SELECT * FROM clientes WHERE email = $1 AND deleted = FALSE",
      [email]
    );
  }

  static async findByCodigo(codigo) {
    return await getQuery(
      "SELECT * FROM clientes WHERE codigo = $1 AND deleted = FALSE",
      [codigo]
    );
  }

  static async create(data) {
    try {
      const {
        nome,
        razao,
        email,
        telefone,
        numero,
        codigo,
        loja,
        tipo,
        nomefantasia,
        finalidade,
        cnpj,
        cep,
        pais,
        estado,
        codmunicipio,
        cidade,
        endereco,
        bairro,
        ddd,
        contato,
        homepage,
        abertura,
      } = data;

      // Usar razao se fornecido, senão usar nome (razao é o campo do formulário, nome é o campo do banco)
      const nomeCliente = razao || nome;

      const sql = `
        INSERT INTO clientes (
          nome, email, telefone, numero, codigo, loja, tipo, nomefantasia,
          finalidade, cnpj, cep, pais, estado, codmunicipio, cidade, endereco,
          bairro, ddd, contato, homepage, abertura
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING *
      `;
      const result = await runQuery(sql, [
        nomeCliente,
        email || null,
        telefone || null,
        numero || null,
        codigo || null,
        loja || null,
        tipo || null,
        nomefantasia || null,
        finalidade || null,
        cnpj || null,
        cep || null,
        pais || null,
        estado || null,
        codmunicipio || null,
        cidade || null,
        endereco || null,
        bairro || null,
        ddd || null,
        contato || null,
        homepage || null,
        abertura || null,
      ]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro no modelo Cliente.create:", error);
      throw error;
    }
  }

  static async update(id, data) {
    // Buscar cliente existente primeiro
    const clienteExistente = await this.findById(id);
    if (!clienteExistente) {
      return null;
    }

    const {
      nome,
      razao,
      email,
      telefone,
      numero,
      codigo,
      loja,
      tipo,
      nomefantasia,
      finalidade,
      cnpj,
      cep,
      pais,
      estado,
      codmunicipio,
      cidade,
      endereco,
      bairro,
      ddd,
      contato,
      homepage,
      abertura,
    } = data;

    // Usar razao se fornecido, senão usar nome, senão manter o existente (razao é o campo do formulário, nome é o campo do banco)
    const nomeCliente = razao || nome || clienteExistente.nome;

    const sql = `
      UPDATE clientes 
      SET nome = $1,
          email = COALESCE($2, email),
          telefone = COALESCE($3, telefone),
          numero = COALESCE($4, numero),
          codigo = COALESCE($5, codigo),
          loja = COALESCE($6, loja),
          tipo = COALESCE($7, tipo),
          nomefantasia = COALESCE($8, nomefantasia),
          finalidade = COALESCE($9, finalidade),
          cnpj = COALESCE($10, cnpj),
          cep = COALESCE($11, cep),
          pais = COALESCE($12, pais),
          estado = COALESCE($13, estado),
          codmunicipio = COALESCE($14, codmunicipio),
          cidade = COALESCE($15, cidade),
          endereco = COALESCE($16, endereco),
          bairro = COALESCE($17, bairro),
          ddd = COALESCE($18, ddd),
          contato = COALESCE($19, contato),
          homepage = COALESCE($20, homepage),
          abertura = COALESCE($21, abertura),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $22 AND deleted = FALSE
      RETURNING *
    `;
    const result = await runQuery(sql, [
      nomeCliente,
      email,
      telefone,
      numero,
      codigo,
      loja,
      tipo,
      nomefantasia,
      finalidade,
      cnpj,
      cep,
      pais,
      estado,
      codmunicipio,
      cidade,
      endereco,
      bairro,
      ddd,
      contato,
      homepage,
      abertura,
      id,
    ]);
    return result.rows[0] || null;
  }

  static async delete(id) {
    const sql = `
      UPDATE clientes 
      SET deleted = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted = FALSE
      RETURNING id
    `;
    const result = await runQuery(sql, [id]);
    return result.rowCount > 0;
  }

  static async restore(id) {
    const sql = `
      UPDATE clientes 
      SET deleted = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted = TRUE
      RETURNING *
    `;
    const result = await runQuery(sql, [id]);
    return result.rows[0] || null;
  }

  static async countAtivos() {
    const result = await getQuery(
      "SELECT COUNT(*) as total FROM clientes WHERE deleted = FALSE"
    );
    return parseInt(result?.total || 0);
  }

  static async countInativos() {
    const result = await getQuery(
      "SELECT COUNT(*) as total FROM clientes WHERE deleted = TRUE"
    );
    return parseInt(result?.total || 0);
  }

  static async countMesAtual() {
    const result = await getQuery(`
      SELECT COUNT(*) as total FROM clientes 
      WHERE deleted = FALSE 
      AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);
    return parseInt(result?.total || 0);
  }

  static async getPorEstado() {
    const rows = await allQuery(`
      SELECT estado, COUNT(*) as total 
      FROM clientes 
      WHERE deleted = FALSE AND estado IS NOT NULL AND estado != ''
      GROUP BY estado
      ORDER BY total DESC
    `);
    return rows.map((item) => ({
      estado: item.estado || "Não informado",
      total: parseInt(item.total || 0),
    }));
  }

  static async getPorTipo() {
    const rows = await allQuery(`
      SELECT 
        CASE 
          WHEN tipo = 'J' THEN 'Pessoa Jurídica'
          WHEN tipo = 'F' THEN 'Pessoa Física'
          ELSE 'Pessoa Física'
        END as tipo,
        COUNT(*) as total 
      FROM clientes 
      WHERE deleted = FALSE
      GROUP BY tipo
    `);
    return rows.map((item) => ({
      tipo: item.tipo,
      total: parseInt(item.total || 0),
    }));
  }

  static async getTopCidades(limit = 5) {
    const rows = await allQuery(
      `
      SELECT cidade, COUNT(*) as total 
      FROM clientes 
      WHERE deleted = FALSE AND cidade IS NOT NULL AND cidade != ''
      GROUP BY cidade
      ORDER BY total DESC
      LIMIT $1
    `,
      [limit]
    );
    return rows.map((item) => ({
      cidade: item.cidade || "Não informado",
      total: parseInt(item.total || 0),
    }));
  }
}

module.exports = Cliente;
