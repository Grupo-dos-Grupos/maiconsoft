# Guia de Deploy

## Deploy Local

### Requisitos

- Node.js 18+
- PostgreSQL 14+

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <repo-url>
cd projeto-2semestre-2025
```

2. **Configure o PostgreSQL**

```bash
# Criar banco de dados
psql -U postgres
CREATE DATABASE sistema_pedidos;
\q
```

3. **Configure as variáveis de ambiente**

Crie `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_pedidos
DB_USER=postgres
DB_PASSWORD=postgres
GEMINI_API_KEY=sua-chave-gemini-aqui (opcional)
```

4. **Instale as dependências**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

5. **Execute o sistema**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

6. **Acesse**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/health

## Deploy em Produção

### Backend

1. **Configure o servidor**
```bash
cd backend
npm install --production
```

2. **Use PM2 para gerenciar processos**
```bash
npm install -g pm2
pm2 start server.js --name sistema-pedidos-api
pm2 save
pm2 startup
```

3. **Configure Nginx (opcional)**
```nginx
server {
    listen 80;
    server_name api.seusite.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Frontend

1. **Build da aplicação**
```bash
cd frontend
npm run build
```

2. **Servir com Nginx**
```nginx
server {
    listen 80;
    server_name seusite.com;
    root /caminho/para/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. **Ou usar serve**
```bash
npm install -g serve
serve -s build -l 3000
```

## Docker Compose (Recomendado)

Crie `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: sistema_pedidos
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: sistema_pedidos
      DB_USER: postgres
      DB_PASSWORD: postgres
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Execute:
```bash
docker-compose up -d
```

