// Script para testar e listar modelos disponíveis do Gemini
require('dotenv').config();
const { listAvailableModels, generateProductDescription } = require('./services/openaiService');

async function testGemini() {
  console.log('🔍 Verificando modelos disponíveis do Gemini...\n');

  try {
    // Listar modelos disponíveis
    const models = await listAvailableModels();
    
    if (models.length === 0) {
      console.log('❌ Nenhum modelo encontrado. Verifique sua chave de API.');
      return;
    }

    console.log('✅ Modelos disponíveis:');
    models.forEach((model, index) => {
      console.log(`  ${index + 1}. ${model.name}`);
      if (model.supportedGenerationMethods) {
        console.log(`     Métodos suportados: ${model.supportedGenerationMethods.join(', ')}`);
      }
    });

    console.log('\n🧪 Testando geração de descrição...\n');
    
    // Testar geração de descrição
    try {
      const description = await generateProductDescription('PS5');
      console.log('✅ Descrição gerada com sucesso:');
      console.log(`   "${description}"\n`);
    } catch (error) {
      console.error('❌ Erro ao gerar descrição:', error.message);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('   Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testGemini();

