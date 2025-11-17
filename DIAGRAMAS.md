# Diagramas do Sistema

## 1. Diagrama de Arquitetura Cliente-Servidor

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Pages     │  │ Components   │  │   Services   │       │
│  │              │  │              │  │              │       │
│  │ Dashboard    │  │   Layout     │  │     API      │       │
│  │ Clientes     │  │              │  │              │       │
│  │ Produtos     │  │              │  │              │       │
│  │ Pedidos      │  │              │  │              │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │ HTTP/REST                       │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                      BACKEND (Express)                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Routes   │──│Controllers │──│   Models   │            │
│  │            │  │            │  │            │            │
│  │ /clientes  │  │ ClienteCtrl│  │  Cliente   │            │
│  │ /produtos  │  │ ProdutoCtrl│  │  Produto   │            │
│  │ /pedidos   │  │ PedidoCtrl │  │  Pedido    │            │
│  └────────────┘  └────────────┘  └─────┬──────┘            │
│                                         │                    │
│  ┌────────────┐  ┌────────────┐       │                    │
│  │  Services  │  │Middleware  │       │                    │
│  │            │  │            │       │                    │
│  │  Gemini    │  │ErrorHandler│       │                    │
│  └────────────┘  └────────────┘       │                    │
│                                         │                    │
└─────────────────────────────────────────┼────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
          ┌─────────▼──────────┐ ┌────────▼────────┐
          │    PostgreSQL     │ │   Gemini API     │
          │   (Principal)     │ │   (IA Descrições)│
          │                   │ │                  │
          │ - Clientes        │ │ - Gemini 1.5     │
          │ - Produtos        │ │   Flash          │
          │ - Pedidos         │ │                  │
          │ - PedidoProduto   │ │                  │
          └───────────────────┘ └──────────────────┘
```

## 2. Diagrama Entidade-Relacionamento (ER)

```
┌─────────────────────────────────────────────────────────────┐
│                          CLIENTES                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ id (PK) SERIAL                                        │  │
│  │ nome VARCHAR(255) NOT NULL                           │  │
│  │ email VARCHAR(255) UNIQUE                           │  │
│  │ telefone VARCHAR(20)                                 │  │
│  │ created_at TIMESTAMP                                 │  │
│  │ updated_at TIMESTAMP                                  │  │
│  │ deleted BOOLEAN                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ 1
                            │
                            │
                            │ N
┌───────────────────────────▼─────────────────────────────────┐
│                          PEDIDOS                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ id (PK) SERIAL                                        │  │
│  │ cliente_id (FK) ───────────────────┐                │  │
│  │ data DATE                           │                │  │
│  │ status VARCHAR(20)                 │                │  │
│  │ total DECIMAL(10,2)                 │                │  │
│  │ created_at TIMESTAMP                │                │  │
│  │ updated_at TIMESTAMP                 │                │  │
│  │ deleted BOOLEAN                     │                │  │
│  └──────────────────────────────────────────────────────┘  │
└───────┬───────────────────────────────────────────────────────┘
        │
        │ 1
        │
        │
        │ N
┌───────▼───────────────────────────────────────────────────────┐
│                    PEDIDO_PRODUTO (N:N)                        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ id (PK) SERIAL                                        │    │
│  │ pedido_id (FK) ───────────┐                           │    │
│  │ produto_id (FK) ──────────────────┐                 │    │
│  │ quantidade INTEGER                 │                 │    │
│  │ preco_unitario DECIMAL(10,2)       │                 │    │
│  │ subtotal DECIMAL(10,2)             │                 │    │
│  │ created_at TIMESTAMP               │                 │    │
│  │ UNIQUE(pedido_id, produto_id)      │                 │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────┬───────────────────────────────────────────────────┘
             │
             │ N
             │
             │
             │ 1
┌────────────▼─────────────────────────────────────────────────┐
│                          PRODUTOS                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ id (PK) SERIAL                                        │   │
│  │ nome VARCHAR(255) NOT NULL                           │   │
│  │ preco DECIMAL(10,2) NOT NULL                        │   │
│  │ descricao TEXT                                       │   │
│  │ created_at TIMESTAMP                                 │   │
│  │ updated_at TIMESTAMP                                  │   │
│  │ deleted BOOLEAN                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘

Relacionamentos:
- Cliente 1:N Pedido
- Pedido N:N Produto (via PedidoProduto)
- Cada pedido tem um cliente obrigatório
- Cada pedido pode ter múltiplos produtos
- Cada produto pode estar em múltiplos pedidos
- O total do pedido é calculado automaticamente baseado nos produtos
```

## 3. Diagrama MVC (Model-View-Controller)

```
┌──────────────────────────────────────────────────────────────┐
│                        VIEW (Frontend)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   Pages    │  │ Components │  │  Services  │             │
│  │            │  │            │  │            │             │
│  │ Produtos   │  │   Layout   │  │    API     │             │
│  │ Clientes   │  │            │  │            │             │
│  │ Pedidos    │  │   Card     │  │  Axios     │             │
│  │            │  │   Form     │  │            │             │
│  │            │  │   Table    │  │            │             │
│  └────────────┘  └────────────┘  └──────┬─────┘             │
│                                          │ HTTP/REST          │
└──────────────────────────────────────────┼────────────────────┘
                                           │
┌──────────────────────────────────────────▼────────────────────┐
│                      CONTROLLER (Backend)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │ Controllers│  │  Routes    │  │Middleware  │             │
│  │            │  │            │  │            │             │
│  │ ClienteCtrl│  │ /clientes  │  │ErrorHandler│             │
│  │ ProdutoCtrl│  │ /produtos  │  │            │             │
│  │ PedidoCtrl │  │ /pedidos   │  │            │             │
│  │            │  │            │  │            │             │
│  │ - list()   │  │ GET, POST  │  │ - validate │             │
│  │ - show()   │  │ PUT, DELETE│  │ - error    │             │
│  │ - create() │  │            │  │ - log      │             │
│  │ - update() │  │            │  │            │             │
│  │ - delete() │  │            │  │            │             │
│  └──────┬─────┘  └────────────┘  └────────────┘             │
│         │                                                     │
│         │ Chama métodos do Model                             │
└─────────┼─────────────────────────────────────────────────────┘
          │
┌─────────▼─────────────────────────────────────────────────────┐
│                         MODEL (Backend)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   Models   │  │  Database  │  │  Services  │             │
│  │            │  │            │  │            │             │
│  │  Cliente   │  │ PostgreSQL │  │   Gemini   │             │
│  │  Produto   │  │            │  │            │             │
│  │  Pedido    │  │  Queries   │  │            │             │
│  │            │  │            │  │            │             │
│  │ - findAll()│  │ - runQuery │  │ - generate │             │
│  │ - findById()│ │ - getQuery  │  │            │             │
│  │ - create() │  │ - allQuery │  │            │             │
│  │ - update() │  │            │  │            │             │
│  │ - delete() │  │            │  │            │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└──────────────────────────────────────────────────────────────┘

Fluxo de Dados:
1. View (React) faz requisição HTTP
2. Controller recebe requisição na rota
3. Controller chama método do Model
4. Model executa query no banco de dados
5. Model retorna dados para Controller
6. Controller retorna resposta JSON para View
7. View atualiza interface do usuário
```

## 4. Fluxo de Criação de Pedido

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIO (Frontend)                        │
│  1. Preenche formulário de pedido                           │
│     - Seleciona cliente                                     │
│     - Adiciona produtos com quantidades                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ POST /api/pedidos
                         │ { clienteId, produtos: [...] }
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  CONTROLLER (PedidoController)               │
│  1. Valida dados recebidos                                  │
│  2. Verifica se cliente existe                              │
│  3. Verifica se produtos existem                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Chama Pedido.create()
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     MODEL (Pedido)                           │
│  1. Calcula total para cada produto:                        │
│     - Busca preço do produto                                │
│     - Multiplica preço × quantidade                         │
│  2. Soma todos os subtotais → total                         │
│  3. Insere pedido na tabela pedidos                         │
│  4. Insere produtos na tabela pedido_produto                 │
│  5. Recalcula total final (garante precisão)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Retorna pedido completo
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTROLLER → VIEW                         │
│  - Retorna JSON com pedido criado                           │
│  - Inclui produtos associados                               │
│  - Total calculado automaticamente                           │
└─────────────────────────────────────────────────────────────┘
```

## 5. Estrutura de Pastas (MVC)

```
backend/
├── config/
│   └── database.js          # Configuração PostgreSQL
├── models/                  # MODELS (MVC)
│   ├── Cliente.js
│   ├── Produto.js
│   └── Pedido.js
├── controllers/             # CONTROLLERS (MVC)
│   ├── ClienteController.js
│   ├── ProdutoController.js
│   └── PedidoController.js
├── routes/                  # ROUTES (MVC)
│   ├── clientes.js
│   ├── produtos.js
│   └── pedidos.js
├── services/                # Serviços externos
│   └── openaiService.js
├── middleware/              # Middlewares
│   └── errorHandler.js
└── server.js                # Servidor principal

frontend/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   └── Layout.js
│   ├── pages/              # VIEWS (MVC)
│   │   ├── Dashboard.js
│   │   ├── ClientesList.js
│   │   ├── ProdutosList.js
│   │   └── PedidosList.js
│   ├── services/          # Serviços de API
│   │   └── api.js
│   └── App.js
```

## Notas sobre os Diagramas

1. **Arquitetura Cliente-Servidor**: Mostra a separação entre frontend e backend, e a integração com bancos de dados e serviços externos.

2. **Diagrama ER**: Mostra as relações entre as entidades, incluindo a relação N:N entre Pedidos e Produtos através da tabela intermediária PedidoProduto.

3. **Diagrama MVC**: Ilustra o padrão Model-View-Controller implementado, mostrando o fluxo de dados desde a View até o Model.

4. **Fluxo de Pedido**: Detalha como o cálculo automático do total funciona quando um pedido é criado.

5. **Estrutura de Pastas**: Mostra a organização do código seguindo o padrão MVC.

