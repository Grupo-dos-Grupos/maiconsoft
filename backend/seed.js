const { pool } = require('./config/database');
const Cliente = require('./models/Cliente');
const Produto = require('./models/Produto');
const Pedido = require('./models/Pedido');

// Sample data
const clientesData = [
  {
    codigo: '000001',
    loja: '01',
    razao: 'Tech Solutions Ltda',
    nomefantasia: 'Tech Solutions',
    tipo: 'J',
    finalidade: 'F',
    cnpj: '12345678000190',
    email: 'contato@techsolutions.com.br',
    telefone: '11987654321',
    ddd: '11',
    cep: '01310100',
    pais: 'BRA',
    estado: 'SP',
    codmunicipio: '3550308',
    cidade: 'São Paulo',
    endereco: 'Avenida Paulista, 1000',
    bairro: 'Bela Vista',
    contato: 'João Silva'
  },
  {
    codigo: '000002',
    loja: '01',
    razao: 'Maria Santos',
    tipo: 'F',
    finalidade: 'C',
    email: 'maria.santos@email.com',
    telefone: '11976543210',
    ddd: '11',
    cep: '04547000',
    pais: 'BRA',
    estado: 'SP',
    codmunicipio: '3550308',
    cidade: 'São Paulo',
    endereco: 'Rua das Flores, 250',
    bairro: 'Vila Olímpia',
    contato: 'Maria Santos'
  },
  {
    codigo: '000003',
    loja: '01',
    razao: 'Comércio Oliveira ME',
    nomefantasia: 'Oliveira Comércio',
    tipo: 'J',
    finalidade: 'C',
    cnpj: '98765432000111',
    email: 'pedro@oliveiracomercio.com.br',
    telefone: '11965432109',
    ddd: '11',
    cep: '20040020',
    pais: 'BRA',
    estado: 'RJ',
    codmunicipio: '3304557',
    cidade: 'Rio de Janeiro',
    endereco: 'Avenida Rio Branco, 500',
    bairro: 'Centro',
    contato: 'Pedro Oliveira'
  },
  {
    codigo: '000004',
    loja: '01',
    razao: 'Ana Costa',
    tipo: 'F',
    finalidade: 'C',
    email: 'ana.costa@email.com',
    telefone: '11954321098',
    ddd: '11',
    cep: '30130100',
    pais: 'BRA',
    estado: 'MG',
    codmunicipio: '3106200',
    cidade: 'Belo Horizonte',
    endereco: 'Rua da Bahia, 1200',
    bairro: 'Centro',
    contato: 'Ana Costa'
  },
  {
    codigo: '000005',
    loja: '01',
    razao: 'Pereira & Associados Ltda',
    nomefantasia: 'Pereira Associados',
    tipo: 'J',
    finalidade: 'F',
    cnpj: '11223344000155',
    email: 'contato@pereiraassociados.com.br',
    telefone: '11943210987',
    ddd: '11',
    cep: '80020000',
    pais: 'BRA',
    estado: 'PR',
    codmunicipio: '4106902',
    cidade: 'Curitiba',
    endereco: 'Avenida Sete de Setembro, 3000',
    bairro: 'Centro',
    contato: 'Carlos Pereira'
  },
  {
    codigo: '000006',
    loja: '01',
    razao: 'Julia Ferreira',
    tipo: 'F',
    finalidade: 'C',
    email: 'julia.ferreira@email.com',
    telefone: '11932109876',
    ddd: '11',
    cep: '90010000',
    pais: 'BRA',
    estado: 'RS',
    codmunicipio: '4314902',
    cidade: 'Porto Alegre',
    endereco: 'Rua dos Andradas, 1000',
    bairro: 'Centro Histórico',
    contato: 'Julia Ferreira'
  },
  {
    codigo: '000007',
    loja: '01',
    razao: 'Alves Construções Ltda',
    nomefantasia: 'Alves Construções',
    tipo: 'J',
    finalidade: 'C',
    cnpj: '55667788000199',
    email: 'contato@alvesconstrucoes.com.br',
    telefone: '11921098765',
    ddd: '11',
    cep: '40020000',
    pais: 'BRA',
    estado: 'BA',
    codmunicipio: '2927408',
    cidade: 'Salvador',
    endereco: 'Avenida Sete de Setembro, 200',
    bairro: 'Centro',
    contato: 'Roberto Alves'
  },
  {
    codigo: '000008',
    loja: '01',
    razao: 'Fernanda Lima',
    tipo: 'F',
    finalidade: 'C',
    email: 'fernanda.lima@email.com',
    telefone: '11910987654',
    ddd: '11',
    cep: '13020000',
    pais: 'BRA',
    estado: 'SP',
    codmunicipio: '3550308',
    cidade: 'Campinas',
    endereco: 'Rua Barão de Jaguara, 500',
    bairro: 'Centro',
    contato: 'Fernanda Lima'
  }
];

const produtosData = [
  { nome: 'Notebook Dell Inspiron', preco: 3299.90, descricao: 'Notebook Dell Inspiron 15 com Intel Core i5, 8GB RAM, 256GB SSD' },
  { nome: 'Mouse Logitech MX Master', preco: 299.90, descricao: 'Mouse sem fio Logitech MX Master 3 com sensor de alta precisão' },
  { nome: 'Teclado Mecânico RGB', preco: 449.90, descricao: 'Teclado mecânico com switches Cherry MX e iluminação RGB' },
  { nome: 'Monitor LG 27" 4K', preco: 1899.90, descricao: 'Monitor LG UltraWide 27 polegadas com resolução 4K UHD' },
  { nome: 'Webcam Logitech C920', preco: 399.90, descricao: 'Webcam Full HD 1080p com microfone estéreo integrado' },
  { nome: 'Headset HyperX Cloud II', preco: 599.90, descricao: 'Headset gamer com som surround 7.1 e microfone removível' },
  { nome: 'SSD Samsung 1TB', preco: 549.90, descricao: 'SSD Samsung 970 EVO Plus 1TB NVMe M.2' },
  { nome: 'Memória RAM 16GB DDR4', preco: 349.90, descricao: 'Kit memória RAM 16GB DDR4 3200MHz Corsair Vengeance' },
  { nome: 'Placa de Vídeo RTX 3060', preco: 2499.90, descricao: 'Placa de vídeo NVIDIA GeForce RTX 3060 12GB GDDR6' },
  { nome: 'Fonte Corsair 750W', preco: 599.90, descricao: 'Fonte de alimentação Corsair RM750x 750W 80 Plus Gold' }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...\n');
    
    // Check if database already has data
    const existingClientes = await pool.query('SELECT COUNT(*) as count FROM clientes');
    const existingProdutos = await pool.query('SELECT COUNT(*) as count FROM produtos');
    
    if (existingClientes.rows[0].count > 0 || existingProdutos.rows[0].count > 0) {
      console.log('⚠️  Database already contains data.');
      console.log('🗑️  Clearing existing data...');
      
      // Clear existing data
      await pool.query('DELETE FROM pedido_produto');
      await pool.query('DELETE FROM pedidos');
      await pool.query('DELETE FROM produtos');
      await pool.query('DELETE FROM clientes');
      console.log('✅ Existing data cleared.\n');
    }
    
    // Seed Clientes
    console.log('👥 Seeding clientes...');
    const clientes = [];
    for (const clienteData of clientesData) {
      const cliente = await Cliente.create(clienteData);
      clientes.push(cliente);
      console.log(`  ✅ Created cliente: ${cliente.codigo} - ${cliente.razao || cliente.nome} (${cliente.cidade || 'Sem cidade'})`);
    }
    console.log(`✅ Created ${clientes.length} clientes.\n`);
    
    // Seed Produtos
    console.log('📦 Seeding produtos...');
    const produtos = [];
    for (const produtoData of produtosData) {
      const produto = await Produto.create(produtoData);
      produtos.push(produto);
      console.log(`  ✅ Created produto: ${produto.nome} - R$ ${parseFloat(produto.preco).toFixed(2)}`);
    }
    console.log(`✅ Created ${produtos.length} produtos.\n`);
    
    // Seed Pedidos
    console.log('🛒 Seeding pedidos...');
    const pedidosData = [
      {
        clienteId: clientes[0].id,
        status: 'concluido',
        produtos: [
          { produtoId: produtos[0].id, quantidade: 1 },
          { produtoId: produtos[2].id, quantidade: 1 }
        ]
      },
      {
        clienteId: clientes[1].id,
        status: 'processando',
        produtos: [
          { produtoId: produtos[1].id, quantidade: 2 },
          { produtoId: produtos[4].id, quantidade: 1 }
        ]
      },
      {
        clienteId: clientes[2].id,
        status: 'pendente',
        produtos: [
          { produtoId: produtos[3].id, quantidade: 1 },
          { produtoId: produtos[5].id, quantidade: 1 }
        ]
      },
      {
        clienteId: clientes[0].id,
        status: 'concluido',
        produtos: [
          { produtoId: produtos[6].id, quantidade: 1 },
          { produtoId: produtos[7].id, quantidade: 2 }
        ]
      },
      {
        clienteId: clientes[3].id,
        status: 'pendente',
        produtos: [
          { produtoId: produtos[8].id, quantidade: 1 },
          { produtoId: produtos[9].id, quantidade: 1 }
        ]
      },
      {
        clienteId: clientes[4].id,
        status: 'concluido',
        produtos: [
          { produtoId: produtos[0].id, quantidade: 1 },
          { produtoId: produtos[1].id, quantidade: 1 },
          { produtoId: produtos[2].id, quantidade: 1 }
        ]
      },
      {
        clienteId: clientes[5].id,
        status: 'cancelado',
        produtos: [
          { produtoId: produtos[3].id, quantidade: 1 }
        ]
      },
      {
        clienteId: clientes[6].id,
        status: 'processando',
        produtos: [
          { produtoId: produtos[4].id, quantidade: 1 },
          { produtoId: produtos[5].id, quantidade: 1 },
          { produtoId: produtos[6].id, quantidade: 1 }
        ]
      }
    ];
    
    const pedidos = [];
    for (const pedidoData of pedidosData) {
      const pedido = await Pedido.create(pedidoData);
      pedidos.push(pedido);
      console.log(`  ✅ Created pedido #${pedido.id} - Cliente: ${pedido.cliente_nome} - Total: R$ ${parseFloat(pedido.total).toFixed(2)}`);
    }
    console.log(`✅ Created ${pedidos.length} pedidos.\n`);
    
    console.log('✨ Database seed completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - ${clientes.length} clientes`);
    console.log(`   - ${produtos.length} produtos`);
    console.log(`   - ${pedidos.length} pedidos`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seed process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };

