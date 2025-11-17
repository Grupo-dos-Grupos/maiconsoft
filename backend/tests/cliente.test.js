const request = require('supertest');
const app = require('../server');

describe('Cliente API', () => {
  let clienteId;

  test('POST /api/clientes - Criar novo cliente', async () => {
    const uniqueEmail = `teste-${Date.now()}@example.com`;
    const response = await request(app)
      .post('/api/clientes')
      .send({
        nome: 'Cliente Teste',
        email: uniqueEmail,
        telefone: '1234567890',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.nome).toBe('Cliente Teste');
    clienteId = response.body.id;
  });

  test('GET /api/clientes - Listar clientes', async () => {
    const response = await request(app)
      .get('/api/clientes')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('GET /api/clientes/:id - Buscar cliente por ID', async () => {
    if (!clienteId) {
      // Se clienteId não foi criado, criar um novo para este teste
      const uniqueEmail = `teste-get-${Date.now()}@example.com`;
      const createResponse = await request(app)
        .post('/api/clientes')
        .send({
          nome: 'Cliente Teste Get',
          email: uniqueEmail,
          telefone: '1234567890',
        });
      clienteId = createResponse.body.id;
    }

    const response = await request(app)
      .get(`/api/clientes/${clienteId}`)
      .expect(200);

    expect(response.body.id).toBe(clienteId);
    expect(response.body.nome).toBeTruthy();
  });

  test('PUT /api/clientes/:id - Atualizar cliente', async () => {
    if (!clienteId) {
      // Se clienteId não foi criado, criar um novo para este teste
      const uniqueEmail = `teste-update-${Date.now()}@example.com`;
      const createResponse = await request(app)
        .post('/api/clientes')
        .send({
          nome: 'Cliente Teste Update',
          email: uniqueEmail,
          telefone: '1234567890',
        });
      clienteId = createResponse.body.id;
    }

    const response = await request(app)
      .put(`/api/clientes/${clienteId}`)
      .send({
        nome: 'Cliente Teste Atualizado',
      })
      .expect(200);

    expect(response.body.nome).toBe('Cliente Teste Atualizado');
  });

  test('DELETE /api/clientes/:id - Excluir cliente', async () => {
    if (!clienteId) {
      // Se clienteId não foi criado, criar um novo para este teste
      const uniqueEmail = `teste-delete-${Date.now()}@example.com`;
      const createResponse = await request(app)
        .post('/api/clientes')
        .send({
          nome: 'Cliente Teste Delete',
          email: uniqueEmail,
          telefone: '1234567890',
        });
      clienteId = createResponse.body.id;
    }

    await request(app)
      .delete(`/api/clientes/${clienteId}`)
      .expect(200);

    // Verificar que foi excluído (soft delete)
    await request(app)
      .get(`/api/clientes/${clienteId}`)
      .expect(404);
  });
});
