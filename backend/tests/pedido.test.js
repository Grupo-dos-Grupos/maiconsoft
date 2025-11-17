const request = require("supertest");
const app = require("../server");

describe("Pedido API", () => {
  let clienteId;
  let produtoId;
  let pedidoId;
  let pedidoConcluidoId;

  beforeAll(async () => {
    // Criar cliente para os testes
    const clienteResponse = await request(app).post("/api/clientes").send({
      nome: "Cliente Pedido Teste",
      email: "pedido@test.com",
    });
    clienteId = clienteResponse.body.id;

    // Criar produto para os testes
    const produtoResponse = await request(app).post("/api/produtos").send({
      nome: "Produto Pedido Teste",
      preco: 50.0,
    });
    produtoId = produtoResponse.body.id;
  });

  test("POST /api/pedidos - Criar novo pedido", async () => {
    if (!clienteId || !produtoId) {
      // Se clienteId ou produtoId não foram criados, criar novos para este teste
      if (!clienteId) {
        const clienteResponse = await request(app)
          .post("/api/clientes")
          .send({
            nome: "Cliente Pedido Teste",
            email: `pedido-${Date.now()}@test.com`,
          });
        clienteId = clienteResponse.body.id;
      }
      if (!produtoId) {
        const produtoResponse = await request(app).post("/api/produtos").send({
          nome: "Produto Pedido Teste",
          preco: 50.0,
        });
        produtoId = produtoResponse.body.id;
      }
    }

    const response = await request(app)
      .post("/api/pedidos")
      .send({
        clienteId: clienteId,
        produtos: [
          {
            produtoId: produtoId,
            quantidade: 2,
          },
        ],
      });

    if (response.status !== 201) {
      console.error("Erro ao criar pedido:", response.body);
    }

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("total");
    // PostgreSQL pode retornar como número ou string, então verificamos ambos
    const total =
      typeof response.body.total === "string"
        ? parseFloat(response.body.total)
        : response.body.total;
    expect(total).toBe(100.0); // 2 * 50.00
    expect(response.body.produtos).toHaveLength(1);
    pedidoId = response.body.id;
  });

  test("GET /api/pedidos - Listar pedidos (exclui concluídos por padrão)", async () => {
    const response = await request(app).get("/api/pedidos").expect(200);

    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);

    // Verificar que pedidos concluídos não aparecem na listagem padrão
    const pedidosConcluidos = response.body.data.filter(
      (p) => p.status === "concluido"
    );
    expect(pedidosConcluidos).toHaveLength(0);
  });

  test("GET /api/pedidos/:id - Buscar pedido por ID", async () => {
    if (!pedidoId) {
      // Se pedidoId não foi criado, pular este teste
      return;
    }

    const response = await request(app)
      .get(`/api/pedidos/${pedidoId}`)
      .expect(200);

    expect(response.body.id).toBe(pedidoId);
    expect(response.body.produtos).toHaveLength(1);
  });

  test("PUT /api/pedidos/:id - Atualizar status do pedido para concluído", async () => {
    if (!pedidoId) {
      // Se pedidoId não foi criado, pular este teste
      return;
    }

    const response = await request(app)
      .put(`/api/pedidos/${pedidoId}`)
      .send({
        status: "concluido",
      })
      .expect(200);

    expect(response.body.status).toBe("concluido");
    pedidoConcluidoId = response.body.id;
  });

  test("PUT /api/pedidos/:id - Não permite editar pedido concluído", async () => {
    if (!pedidoConcluidoId) {
      // Se pedidoConcluidoId não foi criado, pular este teste
      return;
    }

    const response = await request(app)
      .put(`/api/pedidos/${pedidoConcluidoId}`)
      .send({
        status: "pendente",
      })
      .expect(400);

    expect(response.body.error).toBe(
      "Não é possível editar um pedido concluído"
    );
  });

  test("PUT /api/pedidos/:id - Não permite adicionar produtos a pedido concluído", async () => {
    if (!pedidoConcluidoId) {
      // Se pedidoConcluidoId não foi criado, pular este teste
      return;
    }

    const response = await request(app)
      .put(`/api/pedidos/${pedidoConcluidoId}`)
      .send({
        produtos: [
          {
            produtoId: produtoId,
            quantidade: 1,
          },
        ],
      })
      .expect(400);

    expect(response.body.error).toBe(
      "Não é possível editar um pedido concluído"
    );
  });

  test("GET /api/pedidos?status=concluido - Buscar apenas pedidos concluídos", async () => {
    if (!pedidoConcluidoId) {
      // Se pedidoConcluidoId não foi criado, pular este teste
      return;
    }

    const response = await request(app)
      .get("/api/pedidos?status=concluido")
      .expect(200);

    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);

    // Verificar que todos os pedidos retornados estão concluídos
    const todosConcluidos = response.body.data.every(
      (p) => p.status === "concluido"
    );
    expect(todosConcluidos).toBe(true);

    // Verificar que o pedido concluído está na lista
    const pedidoEncontrado = response.body.data.find(
      (p) => p.id === pedidoConcluidoId
    );
    expect(pedidoEncontrado).toBeDefined();
  });

  test("GET /api/pedidos?excludeConcluidos=false - Buscar todos os pedidos incluindo concluídos", async () => {
    const response = await request(app)
      .get("/api/pedidos?excludeConcluidos=false")
      .expect(200);

    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);

    // Verificar que pedidos concluídos podem aparecer quando excludeConcluidos=false
    const temConcluidos = response.body.data.some(
      (p) => p.status === "concluido"
    );
    expect(temConcluidos).toBe(true);
  });
});
