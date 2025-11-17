const request = require('supertest');
const app = require('../server');

describe('Produto API', () => {
  let produtoId;

  test('POST /api/produtos - Criar novo produto', async () => {
    const response = await request(app)
      .post('/api/produtos')
      .send({
        nome: 'Produto Teste',
        preco: 99.99,
        descricao: 'Descrição do produto teste',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.nome).toBe('Produto Teste');
    produtoId = response.body.id;
  });

  test('GET /api/produtos - Listar produtos', async () => {
    const response = await request(app)
      .get('/api/produtos')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('GET /api/produtos/:id - Buscar produto por ID', async () => {
    const response = await request(app)
      .get(`/api/produtos/${produtoId}`)
      .expect(200);

    expect(response.body.id).toBe(produtoId);
  });

  test('PUT /api/produtos/:id - Atualizar produto', async () => {
    const response = await request(app)
      .put(`/api/produtos/${produtoId}`)
      .send({
        preco: 149.99,
      })
      .expect(200);

    expect(parseFloat(response.body.preco)).toBe(149.99);
  });
});

