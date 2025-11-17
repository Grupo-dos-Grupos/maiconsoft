# Sistema de Gestão de Pedidos

Sistema completo de gestão de clientes, produtos e pedidos desenvolvido com Node.js, Express, React e PostgreSQL.

## 📋 Funcionalidades

### ✅ Obrigatórias

- ✅ **Padrão MVC** - Arquitetura bem estruturada seguindo Model-View-Controller
- ✅ **CRUD completo de Cliente** - Criar, ler, atualizar e excluir clientes
- ✅ **CRUD completo de Produto** - Gerenciamento completo de produtos
- ✅ **CRUD completo de Pedido** - Sistema de pedidos com:
  - Associação com Cliente
  - Associação com múltiplos Produtos (relação N:N)
  - Cálculo automático do total do pedido
- ✅ **Tratamento de exceções** - Tratamento robusto de erros no backend
- ✅ **Diagramas** - Arquitetura, ER e MVC documentados

### 🎁 Extras

- ✅ **Bootstrap** - Design System Bootstrap integrado no frontend
- ✅ **Google Gemini Integration** - Geração automática de descrições de produtos usando IA

## 🏗️ Arquitetura

### Backend (Node.js + Express)

A arquitetura segue o padrão MVC com separação clara de responsabilidades:
- **Models**: Contêm toda a lógica de acesso ao banco de dados (queries SQL)
- **Controllers**: Apenas orquestram as requisições, chamando métodos dos models
- **Routes**: Definem os endpoints da API

```
backend/
├── config/
│   └── database.js       # Configuração PostgreSQL
├── models/               # Models (MVC) - Lógica de acesso ao banco
│   ├── Cliente.js        # Métodos CRUD + estatísticas
│   ├── Produto.js        # Métodos CRUD + estatísticas
│   └── Pedido.js         # Métodos CRUD + estatísticas
├── controllers/          # Controllers (MVC) - Orquestração
│   ├── ClienteController.js
│   ├── ProdutoController.js
│   ├── PedidoController.js
│   └── DashboardController.js
├── routes/               # Routes (MVC) - Definição de endpoints
│   ├── clientes.js
│   ├── produtos.js
│   └── pedidos.js
├── services/
│   └── openaiService.js  # Integração Google Gemini
├── middleware/
│   └── errorHandler.js   # Tratamento de erros
├── tests/                # Testes
└── server.js
```

### Frontend (React)

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.js
│   ├── pages/
│   │   ├── Dashboard.js
│   │   ├── ClientesList.js
│   │   ├── ClienteForm.js
│   │   ├── ProdutosList.js
│   │   ├── ProdutoForm.js
│   │   ├── PedidosList.js
│   │   └── PedidoForm.js
│   ├── services/
│   │   └── api.js
│   └── App.js
```

## 🗄️ Banco de Dados

### PostgreSQL (Principal)

- **Clientes**: id, codigo, loja, razao, tipo, nomefantasia, finalidade, cnpj, cep, pais, estado, codmunicipio, cidade, endereco, bairro, ddd, telefone, abertura, contato, email, homepage, created_at, updated_at, deleted
- **Produtos**: id, nome, preco, descricao, created_at, updated_at, deleted
- **Pedidos**: id, cliente_id, data, status, total, created_at, updated_at, deleted
- **PedidoProduto**: id, pedido_id, produto_id, quantidade, preco_unitario, subtotal, created_at


## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

### Configuração do Banco de Dados com Docker

O banco de dados PostgreSQL é configurado automaticamente via Docker Compose.

1. **Iniciar o banco de dados PostgreSQL:**
```bash
# Na raiz do projeto
docker-compose up -d
```

Isso irá:
- Criar e iniciar o container PostgreSQL
- Criar automaticamente o banco `sistema_pedidos`
- Configurar usuário e senha padrão
- Expor a porta 5432 para conexão local

2. **Verificar se o container está rodando:**
```bash
docker ps
```

Você deve ver o container `sistema_pedidos_db` em execução.

3. **Configurar variáveis de ambiente:**

Crie o arquivo `backend/.env`:
```bash
# PostgreSQL (conecta ao container Docker)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_pedidos
DB_USER=postgres
DB_PASSWORD=postgres

# Google Gemini (opcional, para gerar descrições)
GEMINI_API_KEY=sua-chave-gemini-aqui
```

**Nota:** O banco de dados já está configurado no `docker-compose.yml`. Não é necessário criar o banco manualmente.

### Executar Migrations e Seed do Banco de Dados

Após iniciar o container PostgreSQL, é necessário executar as migrations para criar as tabelas e, opcionalmente, popular o banco com dados de exemplo:

1. **Executar as migrations:**
```bash
cd backend
npm run migrate
```

Isso irá criar todas as tabelas necessárias (clientes, produtos, pedidos, pedido_produto) e seus índices.

2. **Popular o banco com dados de exemplo (opcional):**
```bash
cd backend
npm run seed
```

O seed irá criar:
- 8 clientes de exemplo (pessoas físicas e jurídicas)
- 10 produtos de exemplo
- 8 pedidos de exemplo com diferentes status

**Importante:** 
- Execute as migrations antes de iniciar a aplicação pela primeira vez
- O seed pode ser executado múltiplas vezes (ele limpa os dados existentes antes de inserir novos)
- Se você já executou o seed anteriormente e quer manter os dados, pode pular esta etapa

### Instalação

```bash
# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

### Execução

#### Desenvolvimento

**Importante:** Certifique-se de que o banco de dados está rodando antes de iniciar a aplicação:

```bash
# 1. Iniciar o banco de dados (se ainda não estiver rodando)
docker-compose up -d

# 2. Terminal 1 - Backend
cd backend
npm run dev

# 3. Terminal 2 - Frontend
cd frontend
npm start
```

#### Produção

```bash
# Backend
cd backend
npm start

# Frontend (build)
cd frontend
npm run build
npm install -g serve
serve -s build
```

### Script de Deploy Local

```bash
# Executar script de inicialização
chmod +x start-dev.sh
./start-dev.sh
```

## 🧪 Testes

```bash
cd backend
npm test
```

## 📚 Endpoints da API

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Buscar cliente por ID
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Excluir cliente

### Produtos
- `GET /api/produtos` - Listar produtos
- `GET /api/produtos/:id` - Buscar produto por ID
- `POST /api/produtos` - Criar produto
  - Body: `{ nome, preco, descricao?, generateDescription?: boolean }`
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Excluir produto

### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `GET /api/pedidos/:id` - Buscar pedido por ID
- `POST /api/pedidos` - Criar pedido
  - Body: `{ clienteId, produtos: [{ produtoId, quantidade }], status? }`
- `PUT /api/pedidos/:id` - Atualizar pedido
- `DELETE /api/pedidos/:id` - Excluir pedido

### Dashboard
- `GET /api/dashboard` - Métricas gerais do sistema
  - Retorna: totais de clientes, produtos, pedidos, vendas, estatísticas por status, vendas por mês, clientes por estado/tipo, top cidades

## 📊 Diagramas

### Arquitetura Cliente-Servidor

```
┌─────────────┐         HTTP/REST          ┌─────────────┐
│   Browser   │ ◄─────────────────────────► │   Backend   │
│   (React)   │                              │  (Express)  │
└─────────────┘                              └──────┬──────┘
                                                    │
                                    ┌───────────────┼───────────────┐
                                    │               │               │
                           ┌────────▼─────┐ ┌──────▼──────┐ ┌──────▼──────┐
                           │  PostgreSQL  │ │   Gemini    │
                           │  (Principal) │ │     API     │
                           └──────────────┘ └─────────────┘ └─────────────┘
```

### Diagrama ER

```
┌─────────────┐         ┌─────────────┐
│  Clientes   │         │  Produtos   │
│─────────────│         │─────────────│
│ id (PK)     │         │ id (PK)     │
│ nome        │         │ nome        │
│ email       │         │ preco       │
│ telefone    │         │ descricao   │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │                       │
       │              ┌────────▼────────┐
       │              │ PedidoProduto   │
       │              │────────────────│
       │              │ pedido_id (FK)  │
       │              │ produto_id (FK) │
       │              │ quantidade      │
       │              │ preco_unitario  │
       │              │ subtotal       │
       │              └────────┬───────┘
       │                        │
       │                        │
┌──────▼──────┐                │
│   Pedidos   │◄───────────────┘
│─────────────│
│ id (PK)     │
│ cliente_id  │ (FK → Clientes)
│ data        │
│ status      │
│ total       │
└─────────────┘
```

### Diagrama MVC

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │   Pages    │  │ Components │  │  Services  │       │
│  └─────┬──────┘  └────────────┘  └─────┬──────┘       │
│        │                                │               │
│        └──────────────┬─────────────────┘              │
│                       │ HTTP/REST                       │
└───────────────────────┼─────────────────────────────────┘
                       │
┌───────────────────────▼─────────────────────────────────┐
│                    BACKEND (Express)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │   Routes   │──│Controllers │──│   Models   │       │
│  │            │  │            │  │            │       │
│  │ /clientes  │  │ ClienteCtrl│  │  Cliente   │       │
│  │ /produtos  │  │ ProdutoCtrl│  │  Produto   │       │
│  │ /pedidos   │  │ PedidoCtrl │  │  Pedido    │       │
│  │ /dashboard │  │DashboardCtrl│  │            │       │
│  └────────────┘  └────────────┘  └─────┬──────┘       │
│                                         │               │
│  Controllers apenas orquestram         │               │
│  chamadas aos métodos dos Models        │               │
│  (sem SQL puro nos controllers)        │               │
└─────────────────────────────────────────┼───────────────┘
                                          │
                               ┌──────────▼──────────┐
                               │    PostgreSQL       │
                               │  (Queries SQL nos   │
                               │       Models)       │
                               └─────────────────────┘
```

## 🎨 Interface do Usuário

- **Bootstrap 5** - Design System profissional
- **Responsivo** - Funciona em desktop, tablet e mobile
- **Componentes reutilizáveis** - Cards, formulários, tabelas
- **Feedback visual** - Toast notifications para ações

## 🔧 Tecnologias

### Backend
- Node.js
- Express.js
- PostgreSQL (pg)
- Docker & Docker Compose
- Google Gemini API (opcional)
- Jest (testes)

### Frontend
- React 18
- React Router DOM
- Bootstrap 5
- React Bootstrap
- Axios
- React Hot Toast

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend/`:

```env
# PostgreSQL (conecta ao container Docker)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_pedidos
DB_USER=postgres
DB_PASSWORD=postgres

# Google Gemini (opcional)
GEMINI_API_KEY=sua-chave-gemini-aqui
```

**Importante:** 
- As credenciais devem corresponder às configuradas no `docker-compose.yml`
- Certifique-se de que o container PostgreSQL está rodando (`docker-compose up -d`) antes de iniciar a aplicação

## 🐳 Docker

O projeto utiliza Docker Compose para gerenciar o banco de dados PostgreSQL.

### Iniciar o Banco de Dados

```bash
# Iniciar o PostgreSQL
docker-compose up -d

# Ver logs do container
docker-compose logs -f postgres

# Parar o banco de dados
docker-compose down

# Parar e remover volumes (apaga dados)
docker-compose down -v
```

### Estrutura do Docker Compose

O arquivo `docker-compose.yml` configura:
- **PostgreSQL 15 Alpine**: Versão leve e otimizada
- **Porta**: 5432 (mapeada para localhost)
- **Banco de dados**: `sistema_pedidos` (criado automaticamente)
- **Usuário/Senha**: `postgres/postgres`
- **Volume persistente**: Dados são mantidos mesmo após parar o container
- **Healthcheck**: Verifica se o banco está pronto para conexões

### Comandos Úteis

```bash
# Acessar o PostgreSQL via psql
docker exec -it sistema_pedidos_db psql -U postgres -d sistema_pedidos

# Ver status do container
docker-compose ps

# Reiniciar o banco de dados
docker-compose restart postgres
```

## 📸 Screenshots

(Screenshots devem ser adicionados manualmente após execução do sistema)

## 🎯 Próximos Passos

1. Adicionar autenticação e autorização
2. Implementar relatórios em PDF
3. Adicionar exportação de dados em Excel
4. Implementar notificações por email
5. Adicionar dashboard com gráficos avançados

## 👨‍💻 Desenvolvido por

Vinicius Santos de Oliveira

## 📄 Licença

MIT
